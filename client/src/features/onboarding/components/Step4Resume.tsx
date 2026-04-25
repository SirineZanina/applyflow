import { useRef, useState } from 'react'
import { Check, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useUploadResume } from '@/features/resume/hooks'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FILE_MAX_BYTES, RESUME_ACCEPTED_MIMES, RESUME_ACCEPTED_EXTENSIONS } from '@/lib/validation/constants'

interface Props {
  onSkip: () => void
  onUploaded: () => void
}

function validateFile(file: File): string | null {
  if (!RESUME_ACCEPTED_MIMES.includes(file.type as typeof RESUME_ACCEPTED_MIMES[number])) {
    return 'Only PDF and DOCX files are supported.'
  }
  if (file.size > FILE_MAX_BYTES) return `File must be ${FILE_MAX_BYTES / 1024 / 1024} MB or smaller.`
  return null
}

export function Step4Resume({ onSkip, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadResume()

  function handleFile(f: File) {
    const error = validateFile(f)
    if (error) { toast.error(error); return }
    setFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  function handleUpload() {
    if (!file) return
    upload.mutate({ file }, { onSuccess: () => onUploaded() })
  }

  const uploaded = upload.isSuccess

  const dropzoneClass = cn(
    'flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors',
    uploaded
      ? 'border-success bg-success-light'
      : dragging || file
        ? 'border-primary bg-primary-light'
        : 'border-border hover:border-primary/50',
  )

  return (
    <div className="space-y-4">
      {uploaded ? (
        <div className={dropzoneClass}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white">
            <Check size={20} />
          </div>
          <p className="text-sm font-medium text-success">Uploaded!</p>
        </div>
      ) : (
        <label
          htmlFor="resume-file"
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(dropzoneClass, 'cursor-pointer')}
        >
          <input
            id="resume-file"
            ref={inputRef}
            type="file"
            accept={RESUME_ACCEPTED_EXTENSIONS}
            className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          {file ? (
            <>
              <Upload size={24} className="text-primary" />
              <p className="text-sm font-medium text-primary">{file.name}</p>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault()
                  setFile(null)
                  inputRef.current?.click()
                }}
              >
                Change file
              </button>
            </>
          ) : (
            <>
              <Upload size={24} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Drop your resume here</p>
                <p className="mt-0.5 text-xs text-muted-foreground">PDF or DOCX · max {FILE_MAX_BYTES / 1024 / 1024} MB</p>
              </div>
            </>
          )}
        </label>
      )}

      {file && !uploaded && (
        <Button type="button" className="w-full" onClick={handleUpload} disabled={upload.isPending}>
          {upload.isPending ? 'Uploading…' : 'Upload resume'}
        </Button>
      )}

      <button
        type="button"
        onClick={onSkip}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Skip for now
      </button>
    </div>
  )
}
