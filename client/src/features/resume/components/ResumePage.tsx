import { useResumes } from '../hooks'
import { ResumeCard } from './ResumeCard'
import { ResumeUpload } from './ResumeUpload'

export function ResumePage() {
  const { data: resumes, isLoading } = useResumes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resumes</h1>
        <ResumeUpload />
      </div>1

      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

      {!isLoading && resumes?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No resumes yet. Upload your first one to get started.
        </p>
      )}

      <div className="grid gap-4">
        {resumes?.map(resume => (
          <ResumeCard key={resume.id} resume={resume} />
        ))}
      </div>
    </div>
  )
}
