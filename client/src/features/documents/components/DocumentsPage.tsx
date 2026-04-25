import { useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  FileText,
  FolderKanban,
  Mail,
  Plus,
  Trash2,
  Copy,
  Download,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useResumes } from '@/features/resume/hooks'
import { ResumeUpload } from '@/features/resume/components/ResumeUpload'
import {
  FILE_MAX_BYTES,
  PORTFOLIO_ACCEPTED_MIMES,
} from '@/lib/validation/constants'
import {
  useDeleteDocument,
  useDocuments,
  useDuplicateDocument,
  useUploadDocument,
} from '../hooks'

type FilterValue = 'all' | 'resume' | 'TAILORED_RESUME' | 'COVER_LETTER' | 'PORTFOLIO'

interface DocumentsPageProps {
  initialFilter?: FilterValue
}

interface DisplayDocument {
  key: string
  id: string
  source: 'resume' | 'document'
  type: FilterValue | 'resume'
  title: string
  format: string
  sizeLabel: string
  updatedLabel: string
  usedIn: number
  viewUrl: string | null
  content: string | null
  applicationId: string | null
}

function formatBytes(value: number | null | undefined) {
  if (!value) return 'Draft'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

const TYPE_META: Record<
  DisplayDocument['type'],
  {
    label: string
    icon: typeof FileText
    color: string
    background: string
    border: string
  }
> = {
  resume: {
    label: 'Resume',
    icon: FileText,
    color: 'text-primary',
    background: 'bg-primary-light',
    border: 'border-primary',
  },
  TAILORED_RESUME: {
    label: 'Tailored Resume',
    icon: FileText,
    color: 'text-primary',
    background: 'bg-primary-light',
    border: 'border-primary',
  },
  COVER_LETTER: {
    label: 'Cover Letter',
    icon: Mail,
    color: 'text-success',
    background: 'bg-success-light',
    border: 'border-success',
  },
  PORTFOLIO: {
    label: 'Portfolio',
    icon: FolderKanban,
    color: 'text-warning',
    background: 'bg-warning-light',
    border: 'border-warning',
  },
  all: {
    label: 'All',
    icon: FileText,
    color: 'text-muted-foreground',
    background: 'bg-muted',
    border: 'border-border',
  },
}

const PREVIEW_SKELETON_WIDTHS = [
  'w-[85%]',
  'w-4/5',
  'w-3/4',
  'w-[70%]',
  'w-[65%]',
  'w-3/5',
  'w-[55%]',
  'w-1/2',
  'w-[45%]',
] as const

function validatePortfolioFile(file: File): string | null {
  if (!PORTFOLIO_ACCEPTED_MIMES.includes(file.type as typeof PORTFOLIO_ACCEPTED_MIMES[number])) {
    return 'Only PDF, DOCX, PNG, or JPEG files are supported.'
  }
  if (file.size > FILE_MAX_BYTES) {
    return `File must be ${FILE_MAX_BYTES / 1024 / 1024} MB or smaller.`
  }
  return null
}

export function DocumentsPage({ initialFilter = 'all' }: Readonly<DocumentsPageProps>) {
  const [selectedFilter, setSelectedFilter] = useState<FilterValue | null>(null)
  const [portfolioTitle, setPortfolioTitle] = useState('')
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null)
  const [portfolioError, setPortfolioError] = useState<string | null>(null)
  const portfolioInputRef = useRef<HTMLInputElement>(null)

  const { data: resumes } = useResumes()
  const { data: documents } = useDocuments()
  const uploadMutation = useUploadDocument()
  const duplicateMutation = useDuplicateDocument()
  const deleteMutation = useDeleteDocument()

  const filter = selectedFilter ?? initialFilter

  const allItems = useMemo<DisplayDocument[]>(() => {
    const resumeItems: DisplayDocument[] = (resumes ?? []).map((resume) => ({
      key: `resume:${resume.id}`,
      id: resume.id,
      source: 'resume',
      type: 'resume',
      title: resume.label ?? 'Untitled resume',
      format: resume.mimeType === 'application/pdf' ? 'PDF' : 'DOCX',
      sizeLabel: formatBytes(resume.sizeBytes),
      updatedLabel: new Date(resume.lastModifiedDate).toLocaleDateString(),
      usedIn: 0,
      viewUrl: null,
      content: null,
      applicationId: null,
    }))

    const generatedItems: DisplayDocument[] = (documents ?? []).map((document) => ({
      key: `document:${document.id}`,
      id: document.id,
      source: 'document',
      type: document.type,
      title: document.title,
      format: document.mimeType ?? 'text/markdown',
      sizeLabel: formatBytes(document.sizeBytes),
      updatedLabel: new Date(document.lastModifiedDate ?? document.createdDate).toLocaleDateString(),
      usedIn: document.applicationId ? 1 : 0,
      viewUrl: document.viewUrl,
      content: document.content,
      applicationId: document.applicationId,
    }))

    return [...resumeItems, ...generatedItems]
  }, [documents, resumes])

  const filteredItems = useMemo(() => {
    if (filter === 'all') return allItems
    if (filter === 'resume') return allItems.filter((item) => item.type === 'resume')
    return allItems.filter((item) => item.type === filter)
  }, [allItems, filter])

  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const effectiveSelectedKey =
    selectedKey && filteredItems.some((item) => item.key === selectedKey)
      ? selectedKey
      : filteredItems[0]?.key ?? null
  const selected = filteredItems.find((item) => item.key === effectiveSelectedKey) ?? null

  function handlePortfolioFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validatePortfolioFile(file)
    if (err) {
      setPortfolioError(err)
      e.target.value = ''
      return
    }
    setPortfolioError(null)
    setPortfolioFile(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {allItems.length} files · AI-generated and uploaded assets
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ResumeUpload />
          <Button
            variant="outline"
            type="button"
            onClick={() => { setPortfolioError(null); portfolioInputRef.current?.click() }}
          >
            <Plus size={14} />
            Upload portfolio
          </Button>
          <input
            ref={portfolioInputRef}
            type="file"
            accept=".pdf,.docx,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handlePortfolioFileChange}
          />
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {([
            ['all', 'All'],
            ['resume', 'Resumes'],
            ['TAILORED_RESUME', 'Tailored Resumes'],
            ['COVER_LETTER', 'Cover Letters'],
            ['PORTFOLIO', 'Portfolio'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedFilter(value)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === value
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {portfolioError && (
          <p className="text-sm text-destructive">{portfolioError}</p>
        )}

        {portfolioFile ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border bg-card p-3">
            <input
              value={portfolioTitle}
              onChange={(e) => setPortfolioTitle(e.target.value)}
              placeholder="Portfolio title (optional)"
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            />
            <p className="text-xs text-muted-foreground">{portfolioFile.name}</p>
            <Button
              className="h-8 text-xs font-bold"
              onClick={() =>
                uploadMutation.mutate(
                  { file: portfolioFile, title: portfolioTitle || undefined },
                  {
                    onSuccess: () => {
                      setPortfolioFile(null)
                      setPortfolioTitle('')
                    },
                  },
                )
              }
              disabled={uploadMutation.isPending}
            >
              Upload
            </Button>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setPortfolioFile(null)}
            >
              Cancel
            </button>
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="grid auto-rows-min gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const meta = TYPE_META[item.type]
              const Icon = meta.icon
              const isSelected = selected?.key === item.key

              return (
                <button
                  type="button"
                  key={item.key}
                  className={`w-full rounded-xl border bg-card p-4 text-left transition-all ${
                    isSelected
                      ? 'border-primary shadow-[0_0_0_3px_var(--color-primary-light)]'
                      : 'border-border hover:border-primary/60'
                  }`}
                  onClick={() => setSelectedKey(item.key)}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.background} ${meta.color}`}
                    >
                      <Icon size={14} />
                    </div>
                    <Badge
                      className={`h-5 rounded-[4px] px-1.5 text-[10px] font-bold ${meta.background} ${meta.color}`}
                    >
                      {meta.label}
                    </Badge>
                  </div>

                  <h3 className="line-clamp-1 text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.format} · {item.sizeLabel}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Updated {item.updatedLabel}</p>
                  <p className="mt-2 text-[11px] font-semibold text-primary">
                    Used in {item.usedIn} application{item.usedIn === 1 ? '' : 's'}
                  </p>
                </button>
              )
            })}
          </div>

          <aside className="self-start rounded-xl border border-border bg-card p-5">
            {selected ? (
              <>
                {(() => {
                  const meta = TYPE_META[selected.type]
                  const Icon = meta.icon

                  return (
                    <div className="mb-4 flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${meta.background} ${meta.color}`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-[14px] font-bold text-foreground">{selected.title}</h2>
                        <p className="text-xs text-muted-foreground">
                          {selected.format} · {selected.sizeLabel}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Updated {selected.updatedLabel}</p>
                      </div>
                    </div>
                  )
                })()}

                <div className="mb-4 rounded-lg border border-border bg-background p-3">
                  {selected.content ? (
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground">
                      {selected.content}
                    </pre>
                  ) : (
                    <div className="space-y-2 py-1">
                      {Array.from({ length: 7 }).map((_, index) => (
                        <div
                          key={index}
                          className={`h-2 rounded bg-muted ${PREVIEW_SKELETON_WIDTHS[index] ?? 'w-1/2'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
                    Used In
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.applicationId ? (
                      <Badge className="h-5 rounded-[5px] bg-border px-2 text-[10px] text-foreground">
                        Application {selected.applicationId.slice(0, 8)}
                      </Badge>
                    ) : (
                      <Badge className="h-5 rounded-[5px] bg-border px-2 text-[10px] text-muted-foreground">
                        Not linked yet
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selected.viewUrl ? (
                    <a
                      href={selected.viewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold text-foreground"
                    >
                      <Download size={12} />
                      Download
                    </a>
                  ) : null}

                  {selected.source === 'document' ? (
                    <>
                      <Button
                        variant="outline"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => duplicateMutation.mutate(selected.id)}
                        disabled={duplicateMutation.isPending}
                      >
                        <Copy size={12} />
                        Duplicate
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 gap-1.5 text-xs text-danger"
                        onClick={() => deleteMutation.mutate(selected.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={12} />
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Link
                      to="/profile"
                      className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold text-foreground"
                    >
                      Manage Resume
                    </Link>
                  )}

                  {selected.applicationId ? (
                    <Link
                      to="/generator/$applicationId"
                      params={{ applicationId: selected.applicationId }}
                      className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-bold text-primary-foreground"
                    >
                      Open in Generator
                    </Link>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a document to preview details.</p>
            )}
          </aside>
        </div>
      </section>
    </div>
  )
}
