import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DOCUMENT_TITLE_MAX } from '@/lib/validation/constants'
import { useUploadDocument } from '../hooks'

interface Props {
  file: File
  onSuccess: () => void
  onCancel: () => void
}

export function PortfolioUploadBar({ file, onSuccess, onCancel }: Readonly<Props>) {
  const [title, setTitle] = useState('')
  const uploadMutation = useUploadDocument()

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border bg-card p-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Portfolio title (optional)"
        maxLength={DOCUMENT_TITLE_MAX}
        className="h-8 text-xs"
      />
      <p className="text-xs text-muted-foreground">{file.name}</p>
      <Button
        className="h-8 text-xs font-bold"
        onClick={() =>
          uploadMutation.mutate(
            { file, title: title || undefined },
            { onSuccess },
          )
        }
        disabled={uploadMutation.isPending}
      >
        Upload
      </Button>
      <Button variant="outline" className="h-8 text-xs font-bold" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  )
}
