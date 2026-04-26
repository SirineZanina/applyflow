import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePrepareJobApplication, useSaveJobApplication } from '@/features/applications/hooks'
import type { JobCard, JobDetail } from '../types'
import { companyLogoBgClass, matchTone, salaryLabel } from '../utils'

interface Props {
  selectedJob: JobCard | JobDetail | null
  isLoading: boolean
}

function isJobDetail(job: JobCard | JobDetail): job is JobDetail {
  return typeof (job as JobDetail).description === 'string'
}

export function JobDetailPanel({ selectedJob, isLoading }: Readonly<Props>) {
  const navigate = useNavigate()
  const saveMutation = useSaveJobApplication()
  const prepareMutation = usePrepareJobApplication()

  if (!selectedJob) {
    return (
      <aside className="min-h-[72vh] rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Select a job to see details.</p>
      </aside>
    )
  }

  if (isLoading) {
    return (
      <aside className="min-h-[72vh] rounded-xl border border-border bg-card p-5">
        <Skeleton className="h-full min-h-40 rounded-lg" />
      </aside>
    )
  }

  const detail = isJobDetail(selectedJob) ? selectedJob : null

  return (
    <aside className="min-h-[72vh] rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-base font-bold text-white ${companyLogoBgClass(selectedJob.companyName)}`}
        >
          {(selectedJob.companyLogoText ?? selectedJob.companyName.slice(0, 2)).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-extrabold tracking-[-0.02em] text-foreground">
            {selectedJob.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {selectedJob.companyName} · {selectedJob.location}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${matchTone(selectedJob.matchScore ?? 0)}`}>
          {selectedJob.matchScore ?? 0}% match
        </span>
        <span className="inline-flex rounded-md bg-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {salaryLabel(selectedJob.salaryMin, selectedJob.salaryMax, selectedJob.currency)}
        </span>
      </div>

      {detail ? (
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{detail.description}</p>
      ) : null}

      {detail ? (
        <section className="mb-3 rounded-lg border border-success bg-success-light p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-success">Salary Insight</p>
          <p className="mt-1 text-xs text-foreground">{detail.salaryInsight}</p>
        </section>
      ) : null}

      {detail ? (
        <section className="mb-4 rounded-lg border border-primary bg-primary-light p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Interview Tip</p>
          <p className="mt-1 text-xs text-foreground">{detail.interviewTip}</p>
        </section>
      ) : null}

      <div className="space-y-2">
        <Button
          className="h-9 w-full text-[13px] font-bold"
          onClick={() =>
            prepareMutation.mutate(selectedJob.id, {
              onSuccess: (prepared) =>
                navigate({ to: '/generator/$applicationId', params: { applicationId: prepared.applicationId } }),
            })
          }
          disabled={prepareMutation.isPending}
        >
          {prepareMutation.isPending ? 'Preparing...' : 'Generate CV + Cover Letter'}
        </Button>
        <Button
          variant="outline"
          className="h-9 w-full text-[13px] font-semibold"
          onClick={() => saveMutation.mutate(selectedJob.id)}
          disabled={saveMutation.isPending}
        >
          {selectedJob.saved ? 'Saved' : 'Save Job'}
        </Button>
      </div>
    </aside>
  )
}
