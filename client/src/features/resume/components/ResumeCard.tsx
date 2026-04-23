import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ResumeDocument } from '@/types/resume'
import { useSetPrimary, useReparseResume, useDeleteResume } from '../hooks'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface ResumeCardProps {
  resume: ResumeDocument
}

export function ResumeCard({ resume }: ResumeCardProps) {
  const setPrimary = useSetPrimary()
  const reparse = useReparseResume()
  const remove = useDeleteResume()

  const isPending = setPrimary.isPending || reparse.isPending || remove.isPending

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base">
            {resume.label ?? 'Untitled resume'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {formatBytes(resume.sizeBytes)} · {resume.mimeType === 'application/pdf' ? 'PDF' : 'DOCX'}
          </p>
        </div>
        {resume.primary && (
          <Badge variant="secondary">Primary</Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {!resume.primary && (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => setPrimary.mutate(resume.id)}
          >
            Set as primary
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => reparse.mutate(resume.id)}
        >
          {reparse.isPending ? 'Reparsing...' : 'Reparse'}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() => remove.mutate(resume.id)}
        >
          {remove.isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </CardContent>
    </Card>
  )
}
