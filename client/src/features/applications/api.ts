import { apiFetch } from "@/lib/api/client";
import type {
  JobApplication,
  ApplicationStatus,
  PrepareJobApplicationResponse,
  GeneratedDraftsResponse,
} from "./types";

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function listApplications(
  page = 0,
  size = 20,
  status?: ApplicationStatus,
): Promise<PagedResponse<JobApplication>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.set("status", status);
  return apiFetch<PagedResponse<JobApplication>>(
    `/api/v1/applications?${params}`,
  );
}

export async function getApplication(id: string): Promise<JobApplication> {
  return apiFetch<JobApplication>(`/api/v1/applications/${id}`);
}

export async function createApplication(
  data: CreateApplicationInput,
): Promise<JobApplication> {
  return apiFetch<JobApplication>("/api/v1/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateApplication(
  id: string,
  data: UpdateApplicationInput,
): Promise<JobApplication> {
  return apiFetch<JobApplication>(`/api/v1/applications/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function patchApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<JobApplication> {
  return apiFetch<JobApplication>(
    `/api/v1/applications/${id}/status?status=${status}`,
    { method: "PATCH" },
  );
}

export async function deleteApplication(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/applications/${id}`, { method: "DELETE" });
}

export async function saveJobApplication(jobId: string): Promise<JobApplication> {
  return apiFetch<JobApplication>(`/api/v1/jobs/${jobId}/save`, {
    method: "POST",
  });
}

export async function prepareJobApplication(
  jobId: string,
): Promise<PrepareJobApplicationResponse> {
  return apiFetch<PrepareJobApplicationResponse>(`/api/v1/jobs/${jobId}/prepare`, {
    method: "POST",
  });
}

export async function generateApplicationDocuments(
  applicationId: string,
): Promise<GeneratedDraftsResponse> {
  return apiFetch<GeneratedDraftsResponse>(
    `/api/v1/applications/${applicationId}/generate-documents`,
    { method: "POST" },
  );
}

export interface CreateApplicationInput {
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  jobListingId?: string;
  resumeId?: string;
  notes?: string;
}

export interface UpdateApplicationInput {
  companyName?: string;
  jobTitle?: string;
  jobUrl?: string;
  resumeId?: string;
  status?: ApplicationStatus;
  nextStep?: string | null;
  nextStepAt?: string | null;
  notes?: string;
  coverLetter?: string | null;
  aiPrepared?: boolean;
}
