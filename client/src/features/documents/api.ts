import { apiFetch } from "@/lib/api/client";
import type { GeneratedDocument } from "./types";

export async function listDocuments(): Promise<GeneratedDocument[]> {
  return apiFetch<GeneratedDocument[]>("/api/v1/documents");
}

export async function getDocument(id: string): Promise<GeneratedDocument> {
  return apiFetch<GeneratedDocument>(`/api/v1/documents/${id}`);
}

export async function uploadDocument(file: File, title?: string): Promise<GeneratedDocument> {
  const form = new FormData();
  form.append("file", file);
  if (title) form.append("title", title);
  return apiFetch<GeneratedDocument>("/api/v1/documents", {
    method: "POST",
    body: form,
  });
}

export async function updateDocument(
  id: string,
  data: { title?: string; content?: string | null },
): Promise<GeneratedDocument> {
  return apiFetch<GeneratedDocument>(`/api/v1/documents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function duplicateDocument(id: string): Promise<GeneratedDocument> {
  return apiFetch<GeneratedDocument>(`/api/v1/documents/${id}/duplicate`, {
    method: "POST",
  });
}

export async function deleteDocument(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/documents/${id}`, { method: "DELETE" });
}
