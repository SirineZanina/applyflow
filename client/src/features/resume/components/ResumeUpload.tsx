import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUploadResume } from '../hooks'

export function ResumeUpload() {
  const upload = useUploadResume()
  const fileRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    upload.mutate({ file })
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        disabled={upload.isPending}
        onClick={() => fileRef.current?.click()}
      >
        {upload.isPending ? 'Uploading...' : 'Upload resume'}
      </Button>
      <Input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={handleChange}
      />
      {upload.isError && (
        <p className="text-sm text-destructive">Upload failed. Please try again.</p>
      )}
    </div>
  )
}
