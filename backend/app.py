from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import time
import tempfile

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["*"]}})


def get_gemini_model():
    """Configure and return a Gemini model."""
    from dotenv import load_dotenv
    import google.generativeai as genai

    env_path = os.path.join(os.path.dirname(__file__), ".env")
    load_dotenv(env_path, override=True)
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in backend/.env")
    genai.configure(api_key=api_key, transport="rest")
    return genai.GenerativeModel("gemini-2.5-flash")


def extract_text_from_file(filepath: str, filename: str) -> str:
    """Extract plain text from a PDF, DOCX, or TXT file."""
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        import fitz  # PyMuPDF
        text = ""
        doc = fitz.open(filepath)
        for page in doc:
            text += page.get_text()
        doc.close()
        return text

    elif ext == ".docx":
        from docx import Document
        doc = Document(filepath)
        lines = []
        for para in doc.paragraphs:
            if para.text.strip():
                lines.append(para.text)
        for table in doc.tables:
            for row in table.rows:
                lines.append(" | ".join(cell.text for cell in row.cells))
        return "\n".join(lines)

    elif ext == ".txt":
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            return f.read()

    return ""


def extract_topics_with_ai(text: str) -> list:
    """Use Gemini to extract a clean list of course topics from raw curriculum text."""
    MAX_CHARS = 50000
    if len(text) > MAX_CHARS:
        text = text[:MAX_CHARS] + "\n\n[Document truncated...]"

    model = get_gemini_model()

    prompt = f"""You are a curriculum analysis expert. Extract ALL distinct academic/technical topics, skills, and concepts from the curriculum document below.

Return ONLY a valid JSON array of strings. Each string is one topic. Be specific and comprehensive.

Example output:
["Robotic Process Automation", "UiPath Studio", "Machine Learning", "Data Preprocessing"]

CURRICULUM TEXT:
---
{text}
---

Return ONLY the JSON array. No explanation, no markdown."""

    for attempt in range(3):
        try:
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            # Strip markdown fences if present
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                inner = []
                for line in lines[1:]:
                    if line.strip() == "```":
                        break
                    inner.append(line)
                response_text = "\n".join(inner)
            topics = json.loads(response_text)
            if isinstance(topics, list):
                return [str(t) for t in topics if t]
        except Exception as e:
            if attempt == 2:
                raise e
            time.sleep(2)
    return []


@app.route("/")
def index():
    return "<p>Curriculum Mapper API</p>"


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Backend is running"})


@app.route("/api/upload", methods=["POST"])
def upload():
    """
    Upload curriculum files, extract text, then use AI to produce a clean topics list.
    Returns: { uploaded: [...], topics: [...], preview: "..." }
    """
    files = request.files.getlist("files") or request.files.getlist("file")
    uploaded_names = [f.filename for f in files if f.filename]

    if not uploaded_names:
        return jsonify({"error": "no files provided"}), 400

    all_text = ""
    for f in files:
        if not f.filename:
            continue
        # Save to temp file so we can use fitz / docx
        suffix = os.path.splitext(f.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            f.save(tmp.name)
            tmp_path = tmp.name
        try:
            text = extract_text_from_file(tmp_path, f.filename)
            all_text += f"\n\n=== {f.filename} ===\n{text}"
        finally:
            os.unlink(tmp_path)

    if not all_text.strip():
        return jsonify({
            "uploaded": uploaded_names,
            "topics": [],
            "preview": "",
            "warning": "Could not extract any text from the uploaded file(s)."
        })

    # Extract topics using AI
    try:
        topics = extract_topics_with_ai(all_text)
    except Exception as e:
        return jsonify({
            "uploaded": uploaded_names,
            "topics": [],
            "preview": all_text[:300],
            "warning": f"AI topic extraction failed: {str(e)}"
        })

    return jsonify({
        "uploaded": uploaded_names,
        "topics": topics,
        "preview": all_text[:400].strip()
    })


@app.route("/api/analyze", methods=["POST"])
def analyze():
    """
    Body: { query: string, topics: string[] }
    Returns a compatibility analysis: summary paragraph + per-topic pointers.
    """
    data = request.get_json(silent=True) or {}
    query = (data.get("query") or "").strip()
    topics = data.get("topics") or []

    if not query:
        return jsonify({"error": "query is required"}), 400

    if not topics:
        return jsonify({"error": "No curriculum topics found. Please upload a curriculum file first."}), 400

    try:
        model = get_gemini_model()

        topics_text = "\n".join(f"- {t}" for t in topics)

        prompt = f"""You are a curriculum-to-career compatibility expert.

A student is exploring whether this course matches their target role or skills.

Target Role / Keywords: "{query}"

Course Topics Extracted from Curriculum:
{topics_text}

Produce a structured compatibility analysis. Return ONLY valid JSON with this exact structure:
{{
  "summary": "A concise 2-3 sentence paragraph describing how well the course aligns with the target role and what the learner will gain.",
  "compatibility_score": <integer 0-100 representing overall compatibility>,
  "pointers": [
    {{
      "topic": "exact course topic from the list above",
      "relevance": "brief 1-2 sentence explanation of how this topic directly applies to the role",
      "match_level": "high|medium|low"
    }}
  ]
}}

Rules:
- Include only the most relevant topics (top 8 maximum)
- Order by relevance descending (high first)
- Be specific and practical in the relevance explanations
- Return ONLY valid JSON, no markdown, no explanation"""

        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Strip markdown fences if present
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            inner = []
            for line in lines[1:]:
                if line.strip() == "```":
                    break
                inner.append(line)
            response_text = "\n".join(inner)

        result = json.loads(response_text)
        return jsonify({"success": True, "analysis": result})

    except json.JSONDecodeError as e:
        return jsonify({"error": f"AI response could not be parsed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/search", methods=["POST"])
def search():
    data = request.get_json(silent=True) or {}
    query = (data.get("query") or "").strip()
    if not query:
        return jsonify({"error": "query is required"}), 400
    return jsonify({"query": query, "results": []})
