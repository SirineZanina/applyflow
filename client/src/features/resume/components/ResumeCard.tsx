import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ResumeDocument } from '@/types/resume'
import { getResumeViewUrl } from '../api'
import { useDeleteResume, useReparseResume, useSetPrimary } from '../hooks'
import { ResumeEditDialog } from './ResumeEditDialog'
import { ResumePreviewModal } from './ResumePreviewModal'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const statusMeta: Record<
  ResumeDocument['parseStatus'],
  { label: string; variant: 'secondary' | 'outline' | 'destructive'; description: string }
> = {
  PENDING: {
    label: 'Queued',
    variant: 'outline',
    description: 'Queued for parsing.',
  },
  PROCESSING: {
    label: 'Parsing',
    variant: 'outline',
    description: 'Parsing in progress...',
  },
  SUCCESS: {
    label: 'Parsed',
    variant: 'secondary',
    description: 'Structured resume data ready.',
  },
  FAILED: {
    label: 'Parse failed',
    variant: 'destructive',
    description: 'Parsing failed. Reparse after fixing AI provider/quota.',
  },
}

interface ResumeCardProps {
  resume: ResumeDocument
}

export function ResumeCard({ resume }: Readonly<ResumeCardProps>) {
  const setPrimary = useSetPrimary()
  const reparse = useReparseResume()
  const remove = useDeleteResume()

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const status = statusMeta[resume.parseStatus]
  const isMutationPending = setPrimary.isPending || reparse.isPending || remove.isPending

  async function handleOpenPreview() {
    setIsPreviewOpen(true)
    setIsPreviewLoading(true)
    setPreviewError(null)
    setPreviewUrl(null)

    try {
      const url = await getResumeViewUrl(resume.id)
      setPreviewUrl(url)
    } catch {
      setPreviewError('Failed to load preview URL.')
    } finally {
      setIsPreviewLoading(false)
    }
  }

  return (
    <>
      <Card className="overflow-visible">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base">{resume.label ?? 'Untitled resume'}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatBytes(resume.sizeBytes)} ·{' '}
              {resume.mimeType === 'application/pdf' ? 'PDF' : 'DOCX'}
            </p>
          </div>

          <div className="flex gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            {resume.primary && <Badge variant="secondary">Primary</Badge>}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isPreviewLoading}
              onClick={handleOpenPreview}
            >
              {isPreviewLoading ? 'Loading...' : 'View'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  aria-label="Open resume actions"
                >
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={isMutationPending}
                  onSelect={() => setIsEditOpen(true)}
                >
                  Edit
                </DropdownMenuItem>
                {!resume.primary && (
                  <DropdownMenuItem
                    disabled={isMutationPending}
                    onSelect={() => setPrimary.mutate(resume.id)}
                  >
                    Set as primary
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  disabled={isMutationPending}
                  onSelect={() => reparse.mutate(resume.id)}
                >
                  {reparse.isPending ? 'Starting reparse...' : 'Reparse'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={isMutationPending}
                  onSelect={() => remove.mutate(resume.id)}
                >
                  {remove.isPending ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-xs text-muted-foreground">
            {resume.parseStatus === 'FAILED' && resume.parseError
              ? `Parse failed: ${resume.parseError}`
              : status.description}
          </p>
        </CardContent>
      </Card>

      <ResumePreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        resume={resume}
        url={previewUrl}
        isLoading={isPreviewLoading}
        error={previewError}
      />

      {isEditOpen && (
        <ResumeEditDialog onClose={() => setIsEditOpen(false)} resume={resume} />
      )}
    </>
  )
}
