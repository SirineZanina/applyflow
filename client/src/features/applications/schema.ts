import { z } from "zod";
import {
  COMPANY_NAME_MAX,
  JOB_TITLE_MAX,
  JOB_URL_MAX,
  NOTES_MAX,
} from "@/lib/validation/constants";

export const applicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(COMPANY_NAME_MAX),
  jobTitle: z.string().min(1, "Job title is required").max(JOB_TITLE_MAX),
  jobUrl: z
    .url({ message: "Must be a valid URL" })
    .max(JOB_URL_MAX)
    .optional()
    .or(z.literal("")),
  resumeId: z.string().optional(),
  notes: z.string().max(NOTES_MAX).optional().or(z.literal("")),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
