"""
skillToJob2.py
--------------
Skill-to-job-role matching module using SentenceTransformer embeddings
and cosine similarity against a Jobs_Dataset.csv.

Designed to be imported by the Flask app (app.py):
    from skillToJob2 import skills_to_job_roles

Public API
----------
skills_to_job_roles(skill_list: list[str], top_k: int = 5) -> list[dict]
    Given a list of skill strings, return the top_k matching job roles
    as a list of dicts with keys:
        job_title, match_score, skills_required, industry,
        experience_level, education_required
"""

from __future__ import annotations

import os
import logging
from typing import Any

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level singletons – loaded once, reused on every request
# ---------------------------------------------------------------------------
_model = None
_jobs: pd.DataFrame | None = None
_job_embeddings = None       # embeddings for full job_profile
_skills_embeddings = None    # embeddings for skills_required only (for re-ranking)


def _get_csv_path() -> str:
    env_path = os.environ.get("JOBS_DATASET_PATH")
    if env_path and os.path.isfile(env_path):
        return env_path

    candidates = [
        os.path.join(os.path.dirname(__file__), "Jobs_Dataset.csv"),
        os.path.join(os.getcwd(), "Jobs_Dataset.csv"),
    ]
    for path in candidates:
        if os.path.isfile(path):
            return path

    raise FileNotFoundError(
        "Jobs_Dataset.csv not found. Set the JOBS_DATASET_PATH environment "
        "variable or place the file next to skillToJob2.py."
    )


def _load_resources() -> None:
    global _model, _jobs, _job_embeddings, _skills_embeddings

    if _model is not None:
        return

    logger.info("Loading SentenceTransformer model (all-mpnet-base-v2) …")
    from sentence_transformers import SentenceTransformer

    _model = SentenceTransformer("all-mpnet-base-v2")

    csv_path = _get_csv_path()
    logger.info("Loading jobs dataset from %s …", csv_path)
    _jobs = pd.read_csv(csv_path)

    # Full job profile for broad semantic matching
    _jobs["job_profile"] = (
        _jobs["job_title"].astype(str) + " "
        + _jobs["job_description"].astype(str) + " "
        + _jobs["skills_required"].astype(str) + " "
        + _jobs["industry"].astype(str) + " "
        + _jobs["education_required"].astype(str)
    )

    logger.info("Encoding %d job profiles …", len(_jobs))
    _job_embeddings = _model.encode(
        _jobs["job_profile"].tolist(),
        convert_to_tensor=True,
        show_progress_bar=False,
    )

    # Also encode skills_required alone for a focused skill-match signal
    logger.info("Encoding skills_required column for re-ranking …")
    _skills_embeddings = _model.encode(
        _jobs["skills_required"].astype(str).tolist(),
        convert_to_tensor=True,
        show_progress_bar=False,
    )

    logger.info("Job embeddings ready.")


def _build_query(skill_list: list[str]) -> str:
    """
    Build a rich query string that mirrors the density of job_profile.
    A plain skills list is too sparse vs the rich job profile text.
    Domain hints are inferred from skill keywords to boost relevant matches.
    """
    skills_str = ", ".join(skill_list)
    skill_text_lower = skills_str.lower()

    domain_hints = []

    if any(k in skill_text_lower for k in ["python", "machine learning", "deep learning",
                                             "tensorflow", "pytorch", "sklearn", "pandas",
                                             "numpy", "nlp", "computer vision"]):
        domain_hints.append("data science machine learning AI engineer")

    if any(k in skill_text_lower for k in ["sql", "database", "nosql", "mongodb",
                                             "postgres", "mysql", "oracle", "data warehouse"]):
        domain_hints.append("database developer data engineer")

    if any(k in skill_text_lower for k in [".net", "c#", "vb.net", "wpf", "winforms",
                                             "asp.net", "ado.net", "clr", "msil",
                                             ".net framework", "windows forms"]):
        domain_hints.append(".NET software developer Windows application engineer C# developer")

    if any(k in skill_text_lower for k in ["react", "angular", "vue", "javascript",
                                             "typescript", "html", "css", "frontend",
                                             "ui design", "web components"]):
        domain_hints.append("frontend web developer UI engineer")

    if any(k in skill_text_lower for k in ["node", "django", "flask", "spring",
                                             "rest api", "microservice", "backend",
                                             "express", "fastapi"]):
        domain_hints.append("backend developer API engineer")

    if any(k in skill_text_lower for k in ["aws", "azure", "gcp", "docker",
                                             "kubernetes", "terraform", "devops",
                                             "ci/cd", "jenkins", "ansible"]):
        domain_hints.append("DevOps cloud infrastructure engineer")

    if any(k in skill_text_lower for k in ["rpa", "uipath", "automation anywhere",
                                             "blue prism", "bot", "workflow automation"]):
        domain_hints.append("RPA developer automation engineer")

    if any(k in skill_text_lower for k in ["java", "kotlin", "android", "swift",
                                             "ios", "mobile", "flutter", "react native"]):
        domain_hints.append("mobile application developer")

    if any(k in skill_text_lower for k in ["security", "penetration", "cybersecurity",
                                             "ethical hacking", "siem", "secure coding",
                                             "vulnerability", "encryption"]):
        domain_hints.append("cybersecurity analyst security engineer")

    if any(k in skill_text_lower for k in ["tableau", "power bi", "excel",
                                             "data visualization", "business intelligence",
                                             "reporting", "dashboard"]):
        domain_hints.append("business intelligence analyst data analyst")

    if any(k in skill_text_lower for k in ["oop", "object-oriented", "design patterns",
                                             "solid principles", "inheritance",
                                             "polymorphism", "encapsulation"]):
        domain_hints.append("software engineer object-oriented developer")

    domain_str = " ".join(domain_hints)
    query = f"Skills: {skills_str}. Technologies and tools: {skills_str}. {domain_str}".strip()
    return query


# ---------------------------------------------------------------------------
# Public function
# ---------------------------------------------------------------------------

def skills_to_job_roles(
    skill_list: list[str],
    top_k: int = 5,
) -> list[dict[str, Any]]:
    """
    Match a list of skills against the jobs dataset using semantic similarity.

    Uses a two-signal scoring approach for better accuracy:
      1. full job_profile similarity  (broad semantic match)
      2. skills_required similarity   (focused skill-to-skill match)
    Final score = 0.5 * profile_score + 0.5 * skills_score

    Parameters
    ----------
    skill_list : list[str]
    top_k : int  (default 5)

    Returns
    -------
    list[dict] sorted by final_score descending.
    """
    if not skill_list:
        return []

    _load_resources()

    from sentence_transformers import util

    query_text = _build_query(skill_list)
    logger.debug("Query: %s", query_text)

    query_embedding = _model.encode([query_text], convert_to_tensor=True)

    # Signal 1: vs full job profile
    profile_scores = util.cos_sim(query_embedding, _job_embeddings)[0].cpu().numpy()

    # Signal 2: vs skills_required column only
    skills_scores = util.cos_sim(query_embedding, _skills_embeddings)[0].cpu().numpy()

    # Combined score — equal weight
    combined_scores = 0.5 * profile_scores + 0.5 * skills_scores

    jobs_copy = _jobs.copy()
    jobs_copy["match_score"] = combined_scores

    top_matches = (
        jobs_copy
        .sort_values("match_score", ascending=False)
        .head(top_k)
        .reset_index(drop=True)
    )

    results: list[dict[str, Any]] = []
    for _, row in top_matches.iterrows():
        results.append({
            "job_title": str(row.get("job_title", "")),
            "match_score": round(float(row["match_score"]), 4),
            "skills_required": str(row.get("skills_required", "")),
            "industry": str(row.get("industry", "")),
            "experience_level": str(row.get("experience_level", "")),
            "education_required": str(row.get("education_required", "")),
        })

    return results