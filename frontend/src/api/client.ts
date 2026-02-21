/**
 * API client for the Curriculum Mapper backend.
 * In dev, Vite proxies /api to the Flask server (see vite.config.ts).
 */

const API_BASE = '' // relative URLs; proxy sends /api to backend

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

export async function upload(files: File[]): Promise<{ uploaded: string[]; message?: string }> {
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
