import { FileText, FolderKanban, Mail } from 'lucide-react'

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

export type FilterValue = 'all' | 'resume' | 'TAILORED_RESUME' | 'COVER_LETTER' | 'PORTFOLIO'

export interface DisplayDocument {
  key: string
  id: string
  source: 'resume' | 'document'
  type: FilterValue | 'resume'
  title: string
  format: string
  sizeLabel: string
  updatedLabel: string
  applicationId: string | null
  viewUrl: string | null
}

export const TYPE_META: Record<
  DisplayDocument['type'],
  { label: string; icon: typeof FileText; color: string; background: string }
> = {
  resume: { label: 'Resume', icon: FileText, color: 'text-primary', background: 'bg-primary-light' },
  TAILORED_RESUME: { label: 'Tailored Resume', icon: FileText, color: 'text-primary', background: 'bg-primary-light' },
  COVER_LETTER: { label: 'Cover Letter', icon: Mail, color: 'text-success', background: 'bg-success-light' },
  PORTFOLIO: { label: 'Portfolio', icon: FolderKanban, color: 'text-warning', background: 'bg-warning-light' },
  all: { label: 'All', icon: FileText, color: 'text-muted-foreground', background: 'bg-muted' },
}

export function formatBytes(value: number | null | undefined): string {
  if (!value) return 'Draft'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}
