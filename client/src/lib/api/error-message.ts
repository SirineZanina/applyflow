import { HttpError } from "@/types/api";

const ERROR_CODE_MESSAGES: Record<string, string> = {
  BAD_CREDENTIALS: "Email or password is incorrect.",
  ERR_USER_DISABLED: "Your account is disabled. Please contact support.",
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You don't have permission to do that.",
  EMAIL_ALREADY_EXISTS: "An account with that email already exists.",
  PHONE_NUMBER_ALREADY_EXISTS: "That phone number is already in use.",
  PASSWORD_MISMATCH: "Passwords do not match.",
  CHANGE_PASSWORD_MISMATCH: "Current password is incorrect.",
  INVALID_CURRENT_PASSWORD: "Current password is incorrect.",
  RESUME_INVALID_FILE: "Unsupported file type. Please upload a PDF or DOCX.",
  RESUME_FILE_TOO_LARGE: "File is too large. Maximum size is 5 MB.",
  RESUME_FILE_EMPTY: "The file is empty. Please choose a valid file.",
  DOCUMENT_INVALID_UPLOAD: "Invalid document. Please try a different file.",
  STORAGE_UPLOAD_FAILED: "Upload failed. Please try again.",
  VALIDATION_ERROR: "Some fields are invalid. Please check the form.",
  INTERNAL_EXCEPTION: "Something went wrong. Please try again later.",
  AI_REQUEST_FAILED: "Document generation failed. Please try again.",
};

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpError) {
    const mapped = ERROR_CODE_MESSAGES[error.apiError.code];
    return mapped ?? fallback;
  }
  return fallback;
}
