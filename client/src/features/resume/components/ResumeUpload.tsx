import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FILE_MAX_BYTES, RESUME_ACCEPTED_MIMES, RESUME_ACCEPTED_EXTENSIONS } from '@/lib/validation/constants'
import { useUploadResume } from '../hooks'
import { getErrorMessage } from '@/lib/api/error-message'

function validateResumeFile(file: File): string | null {
  if (!RESUME_ACCEPTED_MIMES.includes(file.type as typeof RESUME_ACCEPTED_MIMES[number])) {
    return 'Only PDF and DOCX files are supported.'
  }
  if (file.size > FILE_MAX_BYTES) {
    return `File must be ${FILE_MAX_BYTES / 1024 / 1024} MB or smaller.`
  }
  return null
}

export function ResumeUpload() {
  const upload = useUploadResume()
  const fileRef = useRef<HTMLInputElement>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const err = validateResumeFile(file)
    if (err) {
      setValidationError(err)
      e.target.value = ''
      return
    }

    setValidationError(null)
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    upload.mutate({ file, label: baseName || 'Untitled resume' })
    e.target.value = ''
  }

  const displayError = validationError
    ?? (upload.isError ? getErrorMessage(upload.error, 'Upload failed. Please try again.') : null)

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        disabled={upload.isPending}
        onClick={() => { setValidationError(null); fileRef.current?.click() }}
      >
        {upload.isPending ? 'Uploading...' : 'Upload resume'}
      </Button>
      <Input
        ref={fileRef}
        type="file"
        accept={RESUME_ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={handleChange}
      />
      {displayError && (
        <p className="text-sm text-destructive">{displayError}</p>
      )}
    </div>
  )
}
