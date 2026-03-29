/**
 * API client for the Curriculum Mapper backend.
 * In dev, Vite proxies /api to the Flask server (see vite.config.ts).
 */

const API_BASE = ''

export async function getHealth(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/api/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return res.json()
}

export async function search(query: string): Promise<{ query: string; results: unknown[]; message?: string }> {
  const res = await fetch(`${API_BASE}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Search failed: ${res.status}`)
  }
  return res.json()
}

export interface ExtractedBlock {
  topics: string[]
}

export interface JobMatch {
  job_title: string
  skills_required: string
  industry: string
  experience_level: string
  education_required: string
  match_score: number   // float 0–1 from backend; multiply ×100 to display as %
}

export interface UploadResponse {
  uploaded: string[]
  extracted_content?: ExtractedBlock[]
  topics?: string[]
  job_matches?: JobMatch[]
  preview?: string
  warning?: string
}

export async function upload(files: File[]): Promise<UploadResponse> {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Upload failed: ${res.status}`)
  }
  return res.json()
}

export interface JobsResponse {
  skills: string[]
  job_matches: JobMatch[]
}

/**
 * Directly match a comma-separated skills string to job roles.
 * Hits POST /api/jobs — no file upload required.
 */
export async function matchJobs(skillsText: string, topK = 5): Promise<JobsResponse> {
  // Split by comma, trim whitespace, drop empty entries
  const skills = skillsText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (skills.length === 0) throw new Error('Please enter at least one skill.')

  const res = await fetch(`${API_BASE}/api/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skills, top_k: topK }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Job matching failed: ${res.status}`)
  }
  return res.json()
}

export interface CompatibilityPointer {
  topic: string
  relevance: string
  match_level: 'high' | 'medium' | 'low'
}

export interface AnalysisResult {
  summary: string
  compatibility_score: number
  pointers: CompatibilityPointer[]
}

export async function analyze(query: string, topics?: string[]): Promise<{ success: boolean; analysis: AnalysisResult }> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topics }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Analysis failed: ${res.status}`)
  }
  return res.json()
}

export interface RoadmapItem {
  skill: string
  priority: 'high' | 'medium' | 'low'
  reason: string
  resources: string[]
  estimated_time: string
}

export interface SkillGapResponse {
  matched_skills: string[]
  missing_skills: string[]
  match_percentage: number
  roadmap: RoadmapItem[]
}

export async function getSkillGap(
  userSkills: string[],
  jobTitle: string,
  jobSkills: string
): Promise<SkillGapResponse> {
  const res = await fetch(`${API_BASE}/api/skill-gap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_skills: userSkills,
      job_title: jobTitle,
      job_skills: jobSkills,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Skill gap analysis failed: ${res.status}`)
  }
  return res.json()
}