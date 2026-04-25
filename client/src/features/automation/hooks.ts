import { useMutation } from "@tanstack/react-query";
import { launchAutomation, previewAutomation, type AutomationCriteria } from "./api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/error-message";

export function useAutomationPreview() {
  return useMutation({
    mutationFn: (criteria: AutomationCriteria) => previewAutomation(criteria),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to preview automation."));
    },
  });
}

export function useAutomationLaunch() {
  return useMutation({
    mutationFn: (jobIds: string[]) => launchAutomation(jobIds),
    onSuccess: (response) => {
      toast.success(`Prepared ${response.preparedCount} jobs for review`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to launch automation."));
    },
  });
}
