export type DocumentType = "TAILORED_RESUME" | "COVER_LETTER" | "PORTFOLIO";

export interface GeneratedDocument {
  id: string;
  applicationId: string | null;
  type: DocumentType;
  title: string;
  content: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  viewUrl: string | null;
  createdDate: string;
  lastModifiedDate: string | null;
}
