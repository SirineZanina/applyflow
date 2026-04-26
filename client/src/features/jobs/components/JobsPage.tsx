import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useJob, useJobs } from '../hooks'
import { PAGE_SIZE_DEFAULT, ROLE_TYPES_MAX, SEARCH_QUERY_MAX } from '@/lib/validation/constants'
import { JobDetailPanel } from './JobDetailPanel'
import { JobFilters } from './JobFilters'
import { JobListItem } from './JobListItem'

const JOB_LIST_SKELETON_KEYS = [
  'job-skeleton-1',
  'job-skeleton-2',
  'job-skeleton-3',
  'job-skeleton-4',
  'job-skeleton-5',
  'job-skeleton-6',
]

export function JobsPage() {
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
      size: PAGE_SIZE_DEFAULT,
    }),
    [minMatch, query, remoteOnly, selectedRoles],
  )

  const { data, isLoading } = useJobs(params)
  const jobs = useMemo(() => data?.content ?? [], [data?.content])

  const effectiveSelectedId =
    selectedId && jobs.some((job) => job.id === selectedId)
      ? selectedId
      : jobs[0]?.id ?? null

  const selectedCard = jobs.find((job) => job.id === effectiveSelectedId) ?? null
  const { data: selectedDetail, isLoading: isDetailLoading } = useJob(effectiveSelectedId ?? '')

  function toggleRole(role: string) {
    setSelectedRoles((current) => {
      if (current.includes(role)) {
        return current.filter((r) => r !== role)
      }

      if (current.length < ROLE_TYPES_MAX) {
        return [...current, role]
      }

      return current
    })
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
        <JobFilters
          minMatch={minMatch}
          remoteOnly={remoteOnly}
          selectedRoles={selectedRoles}
          onMinMatchChange={setMinMatch}
          onRemoteOnlyChange={setRemoteOnly}
          onToggleRole={toggleRole}
        />

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
              maxLength={SEARCH_QUERY_MAX}
              className="h-10 pl-9"
            />
          </div>

          <p className="mb-3 text-xs font-medium text-muted-foreground">
            {isLoading ? 'Loading jobs...' : `${jobs.length} jobs found`}
          </p>

          <div className="max-h-[64vh] space-y-2 overflow-y-auto pr-1">
            {isLoading
              ? JOB_LIST_SKELETON_KEYS.map((skeletonKey) => (
                  <Skeleton key={skeletonKey} className="h-28 rounded-lg" />
                ))
              : jobs.map((job) => (
                  <JobListItem
                    key={job.id}
                    job={job}
                    active={job.id === effectiveSelectedId}
                    onClick={() => setSelectedId(job.id)}
                  />
                ))}
          </div>
        </div>

        <JobDetailPanel
          selectedJob={selectedDetail ?? selectedCard}
          isLoading={isDetailLoading}
        />
      </section>
    </div>
  )
}
