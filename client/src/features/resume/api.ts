import { apiFetch } from '@/lib/api/client'
import { HttpError } from '@/types/api'
import type { ResumeDocument } from '@/types/resume'

export async function listResumes(): Promise<ResumeDocument[]> {
  try {
    return await apiFetch<ResumeDocument[]>('/api/v1/resumes')
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) return []
    throw err
  }
}

export async function uploadResume(file: File, label?: string): Promise<ResumeDocument> {
  const form = new FormData()
  form.append('file', file)
  if (label) form.append('label', label)
  return apiFetch<ResumeDocument>('/api/v1/resumes', { method: 'POST', body: form })
}

export async function setPrimary(id: string): Promise<ResumeDocument> {
  return apiFetch<ResumeDocument>(`/api/v1/resumes/${id}/primary`, { method: 'POST' })
}

export async function reparseResume(id: string): Promise<ResumeDocument> {
  return apiFetch<ResumeDocument>(`/api/v1/resumes/${id}/reparse`, { method: 'POST' })
}

export async function deleteResume(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/resumes/${id}`, { method: 'DELETE' })
}
