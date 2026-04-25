import { useResumes } from '../hooks'
import { ResumeCard } from './ResumeCard'
import { ResumeUpload } from './ResumeUpload'
import { FileStack } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function ResumePage() {
  const { data: resumes, isLoading } = useResumes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resumes</h1>
        <ResumeUpload />
      </div>

      {isLoading && (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
              <Skeleton className="h-4 w-72" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && resumes?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <FileStack size={40} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No resumes yet.</p>
          <ResumeUpload />
        </div>
      )}

      <div className="grid gap-4">
        {resumes?.map(resume => (
          <ResumeCard key={resume.id} resume={resume} />
        ))}
      </div>
    </div>
  )
}
