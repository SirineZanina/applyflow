import { useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useResumes } from '@/features/resume/hooks'
import { ResumeUpload } from '@/features/resume/components/ResumeUpload'
import { useApplications } from '@/features/applications/hooks'
import { useConfirm } from '@/hooks/useConfirm'
import { FILE_MAX_BYTES, RESUME_ACCEPTED_MIMES } from '@/lib/validation/constants'
import { useDeleteDocument, useDocuments } from '../hooks'
import { formatBytes, type DisplayDocument, type FilterValue } from '../types'
import { DocumentCard } from './DocumentCard'
import { DocumentDrawer } from './DocumentDrawer'
import { PortfolioUploadBar } from './PortfolioUploadBar'

interface Props {
  initialFilter?: FilterValue
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'resume', label: 'Resumes' },
  { value: 'TAILORED_RESUME', label: 'Tailored Resumes' },
  { value: 'COVER_LETTER', label: 'Cover Letters' },
  { value: 'PORTFOLIO', label: 'Portfolio' },
]

function validatePortfolioFile(file: File): string | null {
  if (!RESUME_ACCEPTED_MIMES.includes(file.type as typeof RESUME_ACCEPTED_MIMES[number])) {
    return 'Only PDF, DOCX files are supported.'
  }
  if (file.size > FILE_MAX_BYTES) {
    return `File must be ${FILE_MAX_BYTES / 1024 / 1024} MB or smaller.`
  }
  return null
}

export function DocumentsPage({ initialFilter = 'all' }: Readonly<Props>) {
  const [selectedFilter, setSelectedFilter] = useState<FilterValue | null>(null)
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null)
  const [portfolioError, setPortfolioError] = useState<string | null>(null)
  const [drawerKey, setDrawerKey] = useState<string | null>(null)
  const portfolioInputRef = useRef<HTMLInputElement>(null)

  const { data: resumes } = useResumes()
  const { data: documents } = useDocuments()
  const { data: applicationsPage } = useApplications()
  const deleteMutation = useDeleteDocument()

  const { confirm, ConfirmDialog } = useConfirm({
    title: 'Delete document',
    description: 'This will permanently delete the document. This action cannot be undone.',
    confirmLabel: 'Delete',
  })

  const filter = selectedFilter ?? initialFilter

  const appMap = useMemo(() => {
    const map = new Map<string, { companyName: string; jobTitle: string }>()
    for (const app of applicationsPage?.content ?? []) {
      map.set(app.id, { companyName: app.companyName, jobTitle: app.jobTitle })
    }
    return map
  }, [applicationsPage])

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
      applicationId: null,
      viewUrl: null,
    }))

    const generatedItems: DisplayDocument[] = (documents ?? []).map((doc) => ({
      key: `document:${doc.id}`,
      id: doc.id,
      source: 'document',
      type: doc.type,
      title: doc.title,
      format: doc.mimeType ?? 'text/markdown',
      sizeLabel: formatBytes(doc.sizeBytes),
      updatedLabel: new Date(doc.lastModifiedDate ?? doc.createdDate).toLocaleDateString(),
      applicationId: doc.applicationId,
      viewUrl: doc.viewUrl,
    }))

    return [...resumeItems, ...generatedItems]
  }, [documents, resumes])

  const filteredItems = useMemo(() => {
    if (filter === 'all') return allItems
    if (filter === 'resume') return allItems.filter((item) => item.type === 'resume')
    return allItems.filter((item) => item.type === filter)
  }, [allItems, filter])

  const drawerDoc = filteredItems.find((item) => item.key === drawerKey) ?? null

  async function handleDelete(id: string) {
    const ok = await confirm()
    if (!ok) return
    deleteMutation.mutate(id, { onSuccess: () => setDrawerKey(null) })
  }

  function handlePortfolioFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validatePortfolioFile(file)
    if (err) { setPortfolioError(err); e.target.value = ''; return }
    setPortfolioError(null)
    setPortfolioFile(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-5">
      <ConfirmDialog />

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
          {FILTERS.map(({ value, label }) => (
            <Button
              key={value}
              variant="ghost"
              onClick={() => setSelectedFilter(value)}
              className={`h-auto rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-transparent ${
                filter === value
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {label}
            </Button>
          ))}
        </div>

        {portfolioError ? <p className="text-sm text-destructive">{portfolioError}</p> : null}

        {portfolioFile ? (
          <PortfolioUploadBar
            file={portfolioFile}
            onSuccess={() => setPortfolioFile(null)}
            onCancel={() => setPortfolioFile(null)}
          />
        ) : null}

        <div className="grid auto-rows-min gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredItems.map((item) => (
            <DocumentCard
              key={item.key}
              item={item}
              app={item.applicationId ? appMap.get(item.applicationId) : null}
              onClick={() => setDrawerKey(item.key)}
            />
          ))}
        </div>
      </section>

      <DocumentDrawer
        doc={drawerDoc}
        app={drawerDoc?.applicationId ? appMap.get(drawerDoc.applicationId) : null}
        isDeletePending={deleteMutation.isPending}
        onClose={() => setDrawerKey(null)}
        onDelete={handleDelete}
      />
    </div>
  )
}
