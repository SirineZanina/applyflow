export type RemotePreference = "REMOTE" | "HYBRID" | "ON_SITE" | "FLEXIBLE";

export interface CandidateProfile {
  id: string;
  userId: string;
  headline: string | null;
  summary: string | null;
  yearsExperience: number | null;
  desiredRoles: string[];
  desiredLocations: string[];
  remotePreference: RemotePreference | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
}
