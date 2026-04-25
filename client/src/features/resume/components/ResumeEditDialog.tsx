import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ResumeDocument } from '@/types/resume'
import { useReplaceResumeFile, useUpdateResumeLabel } from '../hooks'

interface ResumeEditDialogProps {
  onClose: () => void
  resume: ResumeDocument
}

export function ResumeEditDialog({ onClose, resume }: ResumeEditDialogProps) {
  const updateLabel = useUpdateResumeLabel()
  const replaceFile = useReplaceResumeFile()

  const [label, setLabel] = useState(resume.label ?? '')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const isPending = updateLabel.isPending || replaceFile.isPending

  function baseName(selectedFile: File): string {
    return selectedFile.name.replace(/\.[^/.]+$/, '') || 'Untitled resume'
  }

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault()

    const trimmedLabel = label.trim()
    const normalizedLabel = trimmedLabel === '' ? null : trimmedLabel

    if (file) {
      const finalLabel = normalizedLabel ?? baseName(file)
      replaceFile.mutate(
        { id: resume.id, file, label: finalLabel },
        { onSuccess: onClose },
      )
      return
    }

    const currentLabel = resume.label ?? null
    if (normalizedLabel === currentLabel) {
      onClose()
      return
    }

    updateLabel.mutate(
      { id: resume.id, label: normalizedLabel },
      { onSuccess: onClose },
    )
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClose()
        }
      }}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-background p-4 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-base font-semibold">Edit resume</h2>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium">Label</label>
            <Input
              type="text"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={120}
              disabled={isPending}
              placeholder="Resume label"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Replace file (optional)</label>
            <Input
              type="file"
              accept=".pdf,.docx"
              disabled={isPending}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="text-xs text-muted-foreground">Selected: {file.name}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>

          {updateLabel.isError && (
            <p className="text-sm text-destructive">Failed to update label.</p>
          )}
          {replaceFile.isError && (
            <p className="text-sm text-destructive">Failed to replace file.</p>
          )}
        </form>
      </div>
    </div>,
    document.body,
  )
}
