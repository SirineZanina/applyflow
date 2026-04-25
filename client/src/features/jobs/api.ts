import { apiFetch } from "@/lib/api/client";
import type { JobCard, JobDetail } from "./types";
import type { PagedResponse } from "@/features/applications/api";

export interface JobSearchParams {
  query?: string;
  remoteOnly?: boolean;
  minMatch?: number;
  roleTypes?: string[];
  page?: number;
  size?: number;
}

export async function listJobs(params: JobSearchParams = {}): Promise<PagedResponse<JobCard>> {
  const search = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? 12),
  });
  if (params.query) search.set("query", params.query);
  if (params.remoteOnly) search.set("remoteOnly", "true");
  if (params.minMatch !== undefined) search.set("minMatch", String(params.minMatch));
  params.roleTypes?.forEach((roleType) => search.append("roleTypes", roleType));
  return apiFetch<PagedResponse<JobCard>>(`/api/v1/jobs?${search.toString()}`);
}

export async function getJob(id: string): Promise<JobDetail> {
  return apiFetch<JobDetail>(`/api/v1/jobs/${id}`);
}
