import { apiFetch } from "@/lib/api/client";
import type { AutomationLaunchResponse, AutomationPreview } from "./types";

export interface AutomationCriteria {
  query?: string;
  remoteOnly?: boolean;
  minMatch?: number;
  roleTypes?: string[];
  limit?: number;
}

export async function previewAutomation(criteria: AutomationCriteria): Promise<AutomationPreview> {
  return apiFetch<AutomationPreview>("/api/v1/automation/preview", {
    method: "POST",
    body: JSON.stringify(criteria),
  });
}

export async function launchAutomation(jobIds: string[]): Promise<AutomationLaunchResponse> {
  return apiFetch<AutomationLaunchResponse>("/api/v1/automation/launch", {
    method: "POST",
    body: JSON.stringify({ jobIds }),
  });
}
