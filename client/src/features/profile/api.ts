import { apiFetch } from "@/lib/api/client";
import type { CandidateProfile } from "@/types/profile";
import type { ProfileInput } from "./schema";
import { HttpError } from "@/types/api";

export async function getProfile(): Promise<CandidateProfile | null> {
  try {
    return await apiFetch<CandidateProfile>("/api/v1/profile");
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) return null;
    throw err;
  }
}
export async function upsertProfile(
  data: ProfileInput,
): Promise<CandidateProfile> {
  return apiFetch<CandidateProfile>("/api/v1/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
