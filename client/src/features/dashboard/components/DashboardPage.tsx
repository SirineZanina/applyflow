import { Link } from '@tanstack/react-router'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth.store'
import { useDashboardSummary } from '../hooks'

function scoreTone(score: number) {
  if (score >= 90) {
    return 'bg-success-light text-success'
  }
  if (score >= 80) {
    return 'bg-primary-light text-primary'
  }
  if (score >= 70) {
    return 'bg-warning-light text-warning'
  }
  return 'bg-border text-muted-foreground'
}

function statCards(summary: NonNullable<ReturnType<typeof useDashboardSummary>['data']>) {
  return [
    {
      label: 'Applied',
      value: summary.stats.appliedCount,
      sub: 'this month',
      valueClass: 'text-foreground',
    },
    {
      label: 'Interviews',
      value: summary.stats.interviewingCount,
      sub: 'active processes',
      valueClass: 'text-primary',
    },
    {
      label: 'Offers',
      value: summary.stats.offerCount,
      sub: 'pending response',
      valueClass: 'text-success',
    },
    {
      label: 'Avg Match',
      value:
        summary.topMatches.length > 0
          ? `${Math.round(
              summary.topMatches.reduce((acc, match) => acc + match.matchScore, 0) /
                summary.topMatches.length,
            )}%`
          : '0%',
      sub: 'current top matches',
      valueClass: 'text-foreground',
    },
  ]
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  )
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const { data, isLoading } = useDashboardSummary()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (isLoading || !data) {
    return <DashboardSkeleton />
  }

  const firstName = user?.firstName ?? 'there'
  const cards = statCards(data)

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-[26px] font-extrabold tracking-[-0.03em] text-foreground">
          {greeting}, {firstName}.
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You have {data.stats.interviewingCount} active interviews and {data.stats.offerCount}{' '}
          pending offer{data.stats.offerCount === 1 ? '' : 's'}.
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-xl border border-border bg-card px-5 py-4"
          >
            <p className="text-[11px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">
              {card.label}
            </p>
            <p className={`mt-2 text-[32px] leading-none font-extrabold tracking-[-0.03em] ${card.valueClass}`}>
              {card.value}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">{card.sub}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-foreground">Today&apos;s Top Matches</h2>
            <Link to="/jobs" className="text-xs font-semibold text-primary hover:underline">
              See all jobs
            </Link>
          </div>
          {data.topMatches.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.topMatches.slice(0, 3).map((match) => (
                <article
                  key={match.jobId}
                  className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-[0_4px_20px_rgba(97,80,225,0.1)]"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-primary-light text-sm font-bold text-primary">
                      {match.companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${scoreTone(match.matchScore)}`}
                    >
                      {match.matchScore}% match
                    </span>
                  </div>
                  <h3 className="text-[14px] font-bold text-foreground">{match.title}</h3>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {match.companyName} · {match.location}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded-[4px] bg-primary-light px-2 py-0.5 text-[11px] font-medium text-primary">
                      AI match
                    </span>
                    {match.saved ? (
                      <span className="rounded-[4px] bg-success-light px-2 py-0.5 text-[11px] font-medium text-success">
                        Saved
                      </span>
                    ) : null}
                  </div>
                  <Link
                    to="/jobs"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-[7px] border border-border px-3 py-2 text-[12px] font-semibold text-muted-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    Apply with AI
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
              Complete your profile and upload a primary resume to unlock stronger matches.
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-3.5">
          <section className="rounded-xl border border-border bg-card p-4.5">
            <h3 className="text-[11px] font-bold tracking-[0.05em] text-muted-foreground uppercase">
              Upcoming
            </h3>
            <div className="mt-3 space-y-3">
              {data.upcomingItems.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">No dated follow-ups yet.</p>
              ) : (
                data.upcomingItems.slice(0, 3).map((item) => (
                  <Link key={item.applicationId} to="/tracker" className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-light text-[11px] font-bold text-primary">
                      {item.companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-foreground">
                        {item.companyName}
                      </p>
                      <p className="text-[11.5px] text-primary">{item.nextStep ?? item.status}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-xl bg-primary p-4.5 text-primary-foreground">
            <div className="pointer-events-none absolute -top-5 -right-5 h-20 w-20 rounded-full bg-white/10" />
            <h3 className="text-sm font-bold">Auto-Apply is ready</h3>
            <p className="mt-1 text-xs text-primary-foreground/75">
              {data.topMatches.length} high-match jobs are waiting. Let AI prepare them in one flow.
            </p>
            <Link
              to="/auto-apply"
              className="mt-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-[12px] font-bold text-primary"
            >
              Launch Auto-Apply
            </Link>
          </section>

          <section className="rounded-xl border border-border bg-card p-4.5">
            <h3 className="text-[11px] font-bold tracking-[0.05em] text-muted-foreground uppercase">
              Quick Actions
            </h3>
            <div className="mt-2">
              {[
                { label: 'Update your profile', to: '/profile' as const },
                { label: 'Review tracker statuses', to: '/tracker' as const },
                { label: 'Open document manager', to: '/documents' as const },
              ].map((action, index, actions) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center justify-between py-2 text-[13px] font-medium text-foreground"
                >
                  <span>{action.label}</span>
                  <ArrowRight size={14} className="text-primary" />
                  {index < actions.length - 1 ? (
                    <span className="pointer-events-none absolute" aria-hidden="true" />
                  ) : null}
                </Link>
              ))}
            </div>
          </section>

          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary"
          >
            <Sparkles size={14} />
            Explore fresh matches
          </Link>
        </aside>
      </div>
    </div>
  )
}
