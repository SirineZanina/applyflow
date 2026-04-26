import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ResumeDocument } from '@/types/resume'
import {
  FILE_MAX_BYTES,
  LABEL_MAX,
  LABEL_PATTERN,
  RESUME_ACCEPTED_EXTENSIONS,
  RESUME_ACCEPTED_MIMES,
} from '@/lib/validation/constants'
import { useReplaceResumeFile, useUpdateResumeLabel } from '../hooks'

interface ResumeEditDialogProps {
  onClose: () => void
  resume: ResumeDocument
}

export function ResumeEditDialog({ onClose, resume }: ResumeEditDialogProps) {
  const updateLabel = useUpdateResumeLabel()
  const replaceFile = useReplaceResumeFile()

  const [label, setLabel] = useState(resume.label ?? '')
  const [labelError, setLabelError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

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

  function validateLabel(value: string): string | null {
    const trimmed = value.trim()
    if (trimmed.length > LABEL_MAX) return `Label must be ${LABEL_MAX} characters or fewer`
    if (trimmed.length > 0 && !LABEL_PATTERN.test(trimmed)) return 'Label contains invalid characters'
    return null
  }

  function handleLabelChange(value: string) {
    setLabel(value)
    setLabelError(validateLabel(value))
  }

  function handleFileChange(selectedFile: File | null) {
    setFile(selectedFile)
    if (!selectedFile) { setFileError(null); return }
    if (!RESUME_ACCEPTED_MIMES.includes(selectedFile.type as typeof RESUME_ACCEPTED_MIMES[number])) {
      setFileError('Only PDF and DOCX files are supported.')
    } else if (selectedFile.size > FILE_MAX_BYTES) {
      setFileError(`File must be ${FILE_MAX_BYTES / 1024 / 1024} MB or smaller.`)
    } else {
      setFileError(null)
    }
  }

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault()

    const trimmedLabel = label.trim()
    const error = validateLabel(trimmedLabel)
    if (error) { setLabelError(error); return }
    if (fileError) return

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
            <Label className="text-sm font-medium">Label</Label>
            <Input
              type="text"
              value={label}
              onChange={(event) => handleLabelChange(event.target.value)}
              maxLength={LABEL_MAX}
              disabled={isPending}
              placeholder="Resume label"
              aria-invalid={labelError !== null}
            />
            {labelError && <p className="text-xs text-destructive">{labelError}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Replace file (optional)</Label>
            <Input
              type="file"
              accept={RESUME_ACCEPTED_EXTENSIONS}
              disabled={isPending}
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
            />
            {file && !fileError && (
              <p className="text-xs text-muted-foreground">Selected: {file.name}</p>
            )}
            {fileError && <p className="text-xs text-destructive">{fileError}</p>}
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
