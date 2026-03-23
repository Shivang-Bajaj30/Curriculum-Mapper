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

export async function upload(files: File[]): Promise<{ uploaded: string[]; topics?: string[]; preview?: string; warning?: string; message?: string }> {
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
