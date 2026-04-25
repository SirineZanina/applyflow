import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  listApplications,
  getApplication,
  createApplication,
  updateApplication,
  patchApplicationStatus,
  deleteApplication,
  saveJobApplication,
  prepareJobApplication,
  generateApplicationDocuments,
  type CreateApplicationInput,
  type UpdateApplicationInput,
} from "./api";
import type { ApplicationStatus } from "./types";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/error-message";
import { documentKeys } from "@/features/documents/hooks";

export const applicationKeys = {
  all: () => ["applications"] as const,
  paginated: (page: number, size: number, status?: ApplicationStatus) =>
    ["applications", "list", page, size, status] as const,
  detail: (id: string) => ["applications", "detail", id] as const,
};

interface UseApplicationsOptions {
  page?: number;
  size?: number;
  status?: ApplicationStatus;
}

export function useApplications(options: UseApplicationsOptions = {}) {
  const { page = 0, size = 20, status } = options;
  return useQuery({
    queryKey: applicationKeys.paginated(page, size, status),
    queryFn: () => listApplications(page, size, status),
    placeholderData: (prev) => prev,
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => getApplication(id),
    enabled: Boolean(id),
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApplicationInput) => createApplication(data),
    onSuccess: () => {
      toast.success("Application created");
      queryClient.invalidateQueries({ queryKey: applicationKeys.all() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create application."));
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateApplicationInput;
    }) => updateApplication(id, data),
    onSuccess: () => {
      toast.success("Application updated");
      queryClient.invalidateQueries({ queryKey: applicationKeys.all() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update application."));
    },
  });
}

export function usePatchApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: ApplicationStatus;
    }) => patchApplicationStatus(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: applicationKeys.all() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update status."));
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onSuccess: () => {
      toast.success("Application deleted");
      queryClient.invalidateQueries({ queryKey: applicationKeys.all() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete application."));
    },
  });
}

export function useSaveJobApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => saveJobApplication(jobId),
    onSuccess: () => {
      toast.success("Job saved to tracker");
      queryClient.invalidateQueries({ queryKey: applicationKeys.all() });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save job."));
    },
  });
}

export function usePrepareJobApplication() {
  return useMutation({
    mutationFn: (jobId: string) => prepareJobApplication(jobId),
  });
}

export function useGenerateApplicationDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => generateApplicationDocuments(applicationId),
    onSuccess: (_data, applicationId) => {
      toast.success("Draft documents generated");
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(applicationId) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.all() });
      queryClient.invalidateQueries({ queryKey: documentKeys.all() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to generate documents."));
    },
  });
}
