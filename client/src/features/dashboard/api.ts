import { apiFetch } from "@/lib/api/client";
import type { DashboardSummary } from "./types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/api/v1/dashboard/summary");
}
