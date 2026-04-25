import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { usePrepareJobApplication, useSaveJobApplication } from '@/features/applications/hooks'
import { useJob, useJobs } from '../hooks'
import type { JobCard, JobDetail } from '../types'

const ROLE_OPTIONS = [
  'Frontend Engineer',
  'Full Stack Engineer',
  'Backend Engineer',
  'Staff / Lead Engineer',
  'Product Designer',
  'Product Manager',
  'Data Engineer',
  'DevOps / Platform',
] as const

const COMPANY_LOGO_BG_CLASSES = [
  'bg-primary',
  'bg-success',
  'bg-danger',
  'bg-foreground',
  'bg-muted-foreground',
] as const

function companyLogoBgClass(companyName: string) {
  const hash = Array.from(companyName).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return COMPANY_LOGO_BG_CLASSES[hash % COMPANY_LOGO_BG_CLASSES.length]
}

function matchTone(score: number) {
  if (score >= 90) return 'bg-success-light text-success'
  if (score >= 80) return 'bg-primary-light text-primary'
  if (score >= 70) return 'bg-warning-light text-warning'
  return 'bg-border text-muted-foreground'
}

function salaryLabel(min: number | null, max: number | null, currency: string | null) {
  if (min === null && max === null) return 'Salary not disclosed'
  const suffix = currency ?? 'USD'
  if (min !== null && max !== null) {
    return `${Math.round(min / 1000)}K - ${Math.round(max / 1000)}K ${suffix}`
  }
  if (min !== null) return `From ${Math.round(min / 1000)}K ${suffix}`
  return `Up to ${Math.round((max ?? 0) / 1000)}K ${suffix}`
}

function isJobDetail(job: JobCard | JobDetail): job is JobDetail {
  return typeof (job as JobDetail).description === 'string'
}

export function JobsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [minMatch, setMinMatch] = useState(70)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([
    'Frontend Engineer',
    'Full Stack Engineer',
  ])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const params = useMemo(
    () => ({
      query: query || undefined,
      remoteOnly,
      minMatch,
      roleTypes: selectedRoles.length > 0 ? selectedRoles : undefined,
      page: 0,
      size: 24,
    }),
    [minMatch, query, remoteOnly, selectedRoles],
  )

  const { data, isLoading } = useJobs(params)
  const saveMutation = useSaveJobApplication()
  const prepareMutation = usePrepareJobApplication()

  const jobs = useMemo(() => data?.content ?? [], [data?.content])

  const effectiveSelectedId =
    selectedId && jobs.some((job) => job.id === selectedId)
      ? selectedId
      : jobs[0]?.id ?? null

  const selectedCard = jobs.find((job) => job.id === effectiveSelectedId) ?? null
  const { data: selectedDetail, isLoading: isDetailLoading } = useJob(
    effectiveSelectedId ?? '',
  )

  const selectedJob = selectedDetail ?? selectedCard
  const detailedSelectedJob =
    selectedJob && isJobDetail(selectedJob) ? selectedJob : null

  function toggleRole(role: string) {
    setSelectedRoles((current) =>
      current.includes(role)
        ? current.filter((value) => value !== role)
        : [...current, role],
    )
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">Job Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore AI-ranked roles and generate tailored documents from any listing.
        </p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[200px_minmax(0,1fr)_340px]">
        <aside className="h-fit rounded-xl border border-border bg-card p-4">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
            Filters
          </p>

          <div className="mb-4">
            <label htmlFor="min-match" className="mb-2 block text-xs font-semibold text-foreground">
              Min Match Score
            </label>
            <input
              id="min-match"
              type="range"
              min={0}
              max={95}
              step={5}
              value={minMatch}
              onChange={(event) => setMinMatch(Number(event.target.value))}
              className="w-full accent-primary"
            />
            <p className="mt-1 text-xs font-bold text-primary">{minMatch}%+</p>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(event) => setRemoteOnly(event.target.checked)}
                className="accent-primary"
              />
              Remote only
            </label>
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-foreground">Role Type</legend>
            <div className="space-y-1.5">
              {ROLE_OPTIONS.map((role) => (
                <label key={role} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="mt-0.5 accent-primary"
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </aside>

        <div className="min-h-[72vh] rounded-xl border border-border bg-card p-4">
          <div className="relative mb-3">
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search jobs, companies, skills..."
              className="h-10 pl-9"
            />
          </div>

          <p className="mb-3 text-xs font-medium text-muted-foreground">
            {isLoading ? 'Loading jobs...' : `${jobs.length} jobs found`}
          </p>

          <div className="max-h-[64vh] space-y-2 overflow-y-auto pr-1">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 rounded-lg" />
                ))
              : jobs.map((job) => {
                  const active = job.id === effectiveSelectedId
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => setSelectedId(job.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-all ${
                        active
                          ? 'border-primary shadow-[0_0_0_3px_var(--color-primary-light)]'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-sm font-bold text-white ${companyLogoBgClass(
                            job.companyName,
                          )}`}
                        >
                          {(job.companyLogoText ?? job.companyName.slice(0, 2)).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-sm font-bold text-foreground">{job.title}</p>
                            {job.applied ? (
                              <span className="rounded-[4px] bg-success-light px-1.5 py-0.5 text-[10px] font-bold text-success">
                                Applied
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {job.companyName} · {job.location}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {salaryLabel(job.salaryMin, job.salaryMax, job.currency)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {job.matchedSkills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-[4px] bg-primary-light px-1.5 py-0.5 text-[10px] font-medium text-primary"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${matchTone(
                              job.matchScore ?? 0,
                            )}`}
                          >
                            {job.matchScore ?? 0}%
                          </span>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {new Date(job.postedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
          </div>
        </div>

        <aside className="min-h-[72vh] rounded-xl border border-border bg-card p-5">
          {!selectedJob ? (
            <p className="text-sm text-muted-foreground">Select a job to see details.</p>
          ) : isDetailLoading ? (
            <Skeleton className="h-full min-h-40 rounded-lg" />
          ) : (
            <>
              <div className="mb-4 flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-base font-bold text-white ${companyLogoBgClass(
                    selectedJob.companyName,
                  )}`}
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
                <span
                  className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${matchTone(
                    selectedJob.matchScore ?? 0,
                  )}`}
                >
                  {selectedJob.matchScore ?? 0}% match
                </span>
                <span className="inline-flex rounded-md bg-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {salaryLabel(selectedJob.salaryMin, selectedJob.salaryMax, selectedJob.currency)}
                </span>
              </div>

              {detailedSelectedJob ? (
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {detailedSelectedJob.description}
                </p>
              ) : null}

              {detailedSelectedJob ? (
                <section className="mb-3 rounded-lg border border-success bg-success-light p-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-success">
                    Salary Insight
                  </p>
                  <p className="mt-1 text-xs text-foreground">{detailedSelectedJob.salaryInsight}</p>
                </section>
              ) : null}

              {detailedSelectedJob ? (
                <section className="mb-4 rounded-lg border border-primary bg-primary-light p-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-primary">
                    Interview Tip
                  </p>
                  <p className="mt-1 text-xs text-foreground">{detailedSelectedJob.interviewTip}</p>
                </section>
              ) : null}

              <div className="space-y-2">
                <Button
                  className="h-9 w-full text-[13px] font-bold"
                  onClick={() =>
                    prepareMutation.mutate(selectedJob.id, {
                      onSuccess: (prepared) => {
                        navigate({
                          to: '/generator/$applicationId',
                          params: { applicationId: prepared.applicationId },
                        })
                      },
                    })
                  }
                  disabled={prepareMutation.isPending}
                >
                  {prepareMutation.isPending
                    ? 'Preparing...'
                    : 'Generate CV + Cover Letter'}
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
            </>
          )}
        </aside>
      </section>
    </div>
  )
}
