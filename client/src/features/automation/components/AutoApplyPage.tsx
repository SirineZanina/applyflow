import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAutomationLaunch, useAutomationPreview } from '../hooks'

const STEPS = ['Set Criteria', 'Review Matches', 'Confirm & Launch', 'Applying...'] as const
const PERCENT_WIDTH_CLASS: Record<number, string> = {
  0: 'w-0',
  5: 'w-[5%]',
  10: 'w-[10%]',
  15: 'w-[15%]',
  20: 'w-1/5',
  25: 'w-1/4',
  30: 'w-[30%]',
  35: 'w-[35%]',
  40: 'w-2/5',
  45: 'w-[45%]',
  50: 'w-1/2',
  55: 'w-[55%]',
  60: 'w-3/5',
  65: 'w-[65%]',
  70: 'w-[70%]',
  75: 'w-3/4',
  80: 'w-4/5',
  85: 'w-[85%]',
  90: 'w-[90%]',
  95: 'w-[95%]',
  100: 'w-full',
}

function percentWidthClass(value: number) {
  const clamped = Math.max(0, Math.min(100, value))
  const stepped = Math.round(clamped / 5) * 5
  return PERCENT_WIDTH_CLASS[stepped] ?? 'w-0'
}

function scoreTone(score: number) {
  if (score >= 90) return 'bg-success-light text-success'
  if (score >= 80) return 'bg-primary-light text-primary'
  if (score >= 70) return 'bg-warning-light text-warning'
  return 'bg-border text-muted-foreground'
}

function confidenceColor(value: number) {
  if (value >= 85) return 'bg-success text-success'
  if (value >= 70) return 'bg-warning text-warning'
  return 'bg-danger text-danger'
}

function ConfidenceBar({ label, value }: { readonly label: string; readonly value: number }) {
  const colors = confidenceColor(value)
  const barClass = colors.split(' ')[0]
  const textClass = colors.split(' ')[1]

  return (
    <div className="flex items-center gap-2.5">
      <span className="w-34 text-xs text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <div className={`h-full rounded-full ${barClass} ${percentWidthClass(value)}`} />
      </div>
      <span className={`w-9 text-right text-xs font-bold ${textClass}`}>{value}%</span>
    </div>
  )
}

export function AutoApplyPage() {
  const navigate = useNavigate()
  const previewMutation = useAutomationPreview()
  const launchMutation = useAutomationLaunch()

  const [step, setStep] = useState(0)
  const [query, setQuery] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(true)
  const [minMatch, setMinMatch] = useState(75)
  const [salaryMin, setSalaryMin] = useState(120)
  const [includeCoverLetter, setIncludeCoverLetter] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [progress, setProgress] = useState(0)

  const previewJobs = useMemo(
    () => previewMutation.data?.eligibleJobs ?? [],
    [previewMutation.data?.eligibleJobs],
  )

  useEffect(() => {
    if (step !== 3) return
    const interval = setInterval(() => {
      setProgress((current) => Math.min(current + 5, 100))
    }, 120)

    return () => clearInterval(interval)
  }, [step])

  const done = step === 3 && progress >= 100

  const confidenceAverages = useMemo(() => {
    if (previewJobs.length === 0) {
      return [
        { label: 'Skills', value: 0 },
        { label: 'Desired Roles', value: 0 },
        { label: 'Location', value: 0 },
        { label: 'Experience', value: 0 },
        { label: 'Salary', value: 0 },
        { label: 'Cover Letter', value: includeCoverLetter ? 84 : 100 },
      ]
    }

    const selectedJobs = previewJobs.filter((job) => selected.includes(job.jobId))
    const source = selectedJobs.length > 0 ? selectedJobs : previewJobs

    const avg = (values: number[]) =>
      Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)

    return [
      { label: 'Skills', value: avg(source.map((job) => job.breakdown.skills)) },
      { label: 'Desired Roles', value: avg(source.map((job) => job.breakdown.desiredRoles)) },
      { label: 'Location', value: avg(source.map((job) => job.breakdown.location)) },
      { label: 'Experience', value: avg(source.map((job) => job.breakdown.experience)) },
      { label: 'Salary', value: avg(source.map((job) => job.breakdown.salary)) },
      { label: 'Cover Letter', value: includeCoverLetter ? 84 : 100 },
    ]
  }, [includeCoverLetter, previewJobs, selected])

  async function previewJobsForCriteria() {
    previewMutation.mutate(
      {
        query: query || undefined,
        remoteOnly,
        minMatch,
        limit: 12,
      },
      {
        onSuccess: (response) => {
          setSelected(response.eligibleJobs.map((job) => job.jobId))
          setStep(1)
        },
      },
    )
  }

  function launchBatch() {
    if (selected.length === 0) return

    setStep(3)
    setProgress(0)
    launchMutation.mutate(selected)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">Auto-Apply</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Let AI prepare matching applications with tailored resumes and cover letters.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card px-6 py-4">
        <div className="flex items-center">
          {STEPS.map((label, index) => {
            const active = index === step
            const completed = index < step

            return (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      completed
                        ? 'bg-success text-white'
                        : active
                          ? 'bg-primary text-white'
                          : 'bg-border text-muted-foreground'
                    }`}
                  >
                    {completed ? <Check size={14} /> : index + 1}
                  </div>
                  <span
                    className={`text-[11px] ${
                      active ? 'font-semibold text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {index < STEPS.length - 1 ? (
                  <div
                    className={`mb-4 h-0.5 flex-1 ${completed ? 'bg-success' : 'bg-border'}`}
                  />
                ) : null}
              </div>
            )
          })}
        </div>
      </section>

      {step === 0 ? (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-bold text-foreground">Set your auto-apply criteria</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="criteria-query" className="mb-1.5 block text-xs font-semibold text-foreground">
                Search Focus
              </label>
              <Input
                id="criteria-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Frontend, product, remote..."
                className="h-9"
              />
            </div>

            <div>
              <label htmlFor="criteria-min-match" className="mb-1.5 block text-xs font-semibold text-foreground">
                Minimum Match Score
              </label>
              <input
                id="criteria-min-match"
                type="range"
                min={50}
                max={95}
                step={5}
                value={minMatch}
                onChange={(event) => setMinMatch(Number(event.target.value))}
                className="w-full accent-primary"
              />
              <p className="mt-1 text-xs font-bold text-primary">{minMatch}%+ jobs</p>
            </div>

            <div>
              <label htmlFor="criteria-salary" className="mb-1.5 block text-xs font-semibold text-foreground">
                Minimum Salary (K)
              </label>
              <input
                id="criteria-salary"
                type="range"
                min={80}
                max={250}
                step={10}
                value={salaryMin}
                onChange={(event) => setSalaryMin(Number(event.target.value))}
                className="w-full accent-primary"
              />
              <p className="mt-1 text-xs font-bold text-primary">${salaryMin}K+</p>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(event) => setRemoteOnly(event.target.checked)}
                  className="accent-primary"
                />
                Remote positions only
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={includeCoverLetter}
                  onChange={(event) => setIncludeCoverLetter(event.target.checked)}
                  className="accent-primary"
                />
                Generate cover letters
              </label>
            </div>
          </div>

          <Button
            className="mt-6 h-9 text-[13px] font-bold"
            onClick={previewJobsForCriteria}
            disabled={previewMutation.isPending}
          >
            {previewMutation.isPending ? 'Loading matches...' : 'Next: Review Matches'}
          </Button>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-bold text-foreground">Review matched jobs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Deselect any roles you do not want in this batch.
          </p>

          <div className="mt-4 space-y-2.5">
            {previewJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matching jobs found.</p>
            ) : (
              previewJobs.map((job) => {
                const checked = selected.includes(job.jobId)
                const confidence = job.confidenceLabel.toLowerCase().includes('high') ? 90 : 78
                return (
                  <label
                    key={job.jobId}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 ${
                      checked
                        ? 'border-primary bg-primary-light'
                        : 'border-border bg-card'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, job.jobId]
                            : current.filter((value) => value !== job.jobId),
                        )
                      }
                      className="accent-primary"
                    />
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-light text-xs font-bold text-primary">
                      {job.companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{job.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{job.companyName}</p>
                    </div>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${scoreTone(job.matchScore)}`}>
                      {job.matchScore}%
                    </span>
                    <p className={`text-right text-xs font-bold ${confidence >= 85 ? 'text-success' : 'text-warning'}`}>
                      {confidence}%
                    </p>
                  </label>
                )
              })
            )}
          </div>

          <div className="mt-5 flex gap-2">
            <Button variant="outline" className="h-9 text-[13px] font-semibold" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              className="h-9 text-[13px] font-bold"
              onClick={() => setStep(2)}
              disabled={selected.length === 0}
            >
              Next: Confirm
            </Button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-bold text-foreground">Ready to apply</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {selected.length} applications will be prepared with tailored documents.
          </p>

          <div className="mt-4 rounded-lg bg-background p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
              Confidence by Field
            </p>
            <div className="space-y-2.5">
              {confidenceAverages.map((entry) => (
                <ConfidenceBar key={entry.label} label={entry.label} value={entry.value} />
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-warning bg-warning-light p-3 text-xs text-foreground">
            Fields below 80% confidence are flagged for manual review in the generator.
          </div>

          <div className="mt-5 flex gap-2">
            <Button variant="outline" className="h-9 text-[13px] font-semibold" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              className="h-9 text-[13px] font-bold"
              onClick={launchBatch}
              disabled={selected.length === 0 || launchMutation.isPending}
            >
              {launchMutation.isPending ? 'Launching...' : 'Launch Auto-Apply'}
            </Button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="rounded-xl border border-border bg-card px-6 py-10 text-center">
          {!done ? (
            <>
              <p className="text-[40px] font-extrabold tracking-[-0.04em] text-primary">
                {Math.round((progress / 100) * selected.length)}
                <span className="text-xl text-muted-foreground">/{selected.length}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Applications prepared...</p>

              <div className="mx-auto mt-5 h-2 max-w-md overflow-hidden rounded-full bg-border">
                <div className={`h-full rounded-full bg-primary ${percentWidthClass(progress)}`} />
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Tailoring resumes and building tracker records.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-light text-success">
                <Check size={24} />
              </div>
              <h2 className="mt-4 text-xl font-extrabold text-foreground">All done!</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {selected.length} applications are ready for review in the tracker.
              </p>
              <Button className="mt-5 h-9 text-[13px] font-bold" onClick={() => navigate({ to: '/tracker' })}>
                View in Tracker
              </Button>
            </>
          )}
        </section>
      ) : null}
    </div>
  )
}
