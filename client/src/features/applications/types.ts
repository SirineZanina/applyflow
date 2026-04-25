import type { ResumeDocument } from "@/types/resume";
import type { GeneratedDocument } from "@/features/documents/types";

export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "INTERVIEWING"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

export interface JobApplication {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string | null;
  jobListingId: string | null;
  status: ApplicationStatus;
  appliedAt: string | null;
  matchScore: number | null;
  nextStep: string | null;
  nextStepAt: string | null;
  notes: string | null;
  coverLetter: string | null;
  aiPrepared: boolean;
  resume: Pick<ResumeDocument, "id" | "label" | "primary"> | null;
  createdDate: string;
  lastModifiedDate: string | null;
}

export interface PrepareJobApplicationResponse {
  applicationId: string;
  created: boolean;
}

export interface GeneratedDraftsResponse {
  suggestions: string[];
  tailoredResume: GeneratedDocument;
  coverLetter: GeneratedDocument;
  generatedAt: string;
}
