import { useQuery } from "@tanstack/react-query";
import { getJob, listJobs, type JobSearchParams } from "./api";

export const jobsKeys = {
  list: (params: JobSearchParams) => ["jobs", "list", params] as const,
  detail: (id: string) => ["jobs", "detail", id] as const,
};

export function useJobs(params: JobSearchParams) {
  return useQuery({
    queryKey: jobsKeys.list(params),
    queryFn: () => listJobs(params),
    placeholderData: (previous) => previous,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: jobsKeys.detail(id),
    queryFn: () => getJob(id),
    enabled: Boolean(id),
  });
}
