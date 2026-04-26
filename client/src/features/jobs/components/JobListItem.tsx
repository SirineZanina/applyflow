import type { JobCard } from '../types'
import { companyLogoBgClass, salaryLabel, timeAgo } from '../utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  job: JobCard
  active: boolean
  onClick: () => void
}

function matchBadgeClass(score: number): string {
  if (score >= 90) return 'bg-success-light text-success'
  if (score >= 80) return 'bg-primary-light text-primary'
  if (score >= 70) return 'bg-warning-light text-warning'
  return 'bg-border text-muted-foreground'
}

export function JobListItem({ job, active, onClick }: Readonly<Props>) {
  const logoText = (job.companyLogoText ?? job.companyName.slice(0, 2)).toUpperCase()
  const salary = salaryLabel(job.salaryMin, job.salaryMax, job.currency)
  const subtitle = [job.companyName, job.location, salary].filter(Boolean).join(' · ')

 return (
    <Card
      role="button"
      onClick={onClick}
      className={`gap-0 h-auto w-full justify-start rounded-xl border p-3.5 hover:bg-transparent ${
        active
          ? 'border-primary bg-primary-light/20 shadow-[0_0_0_3px_var(--color-primary-light)]'
          : 'border-border hover:border-primary/40'
      }`}
    >
      {/* Row 1: logo | title + description | match score + time */}
      <CardHeader className="flex flex-row items-start gap-3 p-0">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold text-white ${companyLogoBgClass(job.companyName)}`}>
          {logoText.slice(0, 2)}
        </div>

        <div className="min-w-0 flex-1">
          <CardTitle className="flex flex-wrap items-center gap-1.5 text-[13.5px] font-bold leading-snug text-foreground">
            {job.title}
            {job.applied ? (
              <span className="rounded-lg bg-success-light px-1.5 py-0.5 text-[10px] font-bold text-success">
                Applied
              </span>
            ) : null}
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-muted-foreground">
            {subtitle}
          </CardDescription>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${matchBadgeClass(job.matchScore ?? 0)}`}>
            ★ {job.matchScore ?? 0}% match
          </span>
          <span className="text-[11px] text-muted-foreground">{timeAgo(job.postedAt)}</span>
        </div>
      </CardHeader>

      {/* Row 2: skills */}
    <CardContent className="flex flex-wrap gap-1 p-0">
        {job.matchedSkills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-primary-light px-2 py-0.5 text-[11px] font-medium text-primary"
          >
            {skill}
          </span>
        ))}
      </CardContent>
    </Card>
  )
}