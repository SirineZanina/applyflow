import type { WizardData } from '../types'

interface Props {
  data: WizardData
  fullName: string
  onFinish: () => void
  isPending: boolean
}

export function Step5Done({ data, fullName, onFinish, isPending }: Props) {
  const skillsSummary =
    data.skills.length > 0
      ? data.skills.slice(0, 4).join(', ') + (data.skills.length > 4 ? ` +${data.skills.length - 4}` : '')
      : '—'

  const summary = [
    { label: 'Name',       value: fullName || '—' },
    { label: 'Title',      value: data.headline || '—' },
    { label: 'Skills',     value: skillsSummary },
    { label: 'Work Style', value: data.workStyle || '—' },
    { label: 'Salary',     value: `$${data.salaryMin}K – $${data.salaryMax}K` },
  ]

  const firstName = fullName.split(' ')[0] || 'there'

  return (
    <div className="py-3 text-center">
      {/* Success circle */}
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div className="mb-2 text-lg font-extrabold tracking-[-0.02em] text-foreground">
        Profile complete, {firstName}!
      </div>
      <div className="mx-auto mb-6 max-w-80 text-[13px] leading-relaxed text-muted-foreground">
        ApplyFlow will start finding job matches right now. Your first matches are ready.
      </div>

      {/* Summary card */}
      <div className="mb-6 rounded-xl border border-border bg-background p-4 text-left">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
          Your Profile Summary
        </div>
        {summary.map(({ label, value }) => (
          <div key={label} className="mb-1.5 flex justify-between text-[12.5px]">
            <span className="font-medium text-muted-foreground">{label}</span>
            <span className="max-w-[55%] text-right font-semibold text-foreground">
              {value}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onFinish}
        disabled={isPending}
        className={`w-full rounded-lg border-0 px-5 py-3 text-sm font-bold text-white transition-all ${
          isPending
            ? 'cursor-default bg-muted-foreground opacity-60'
            : 'cursor-pointer bg-primary'
        }`}
      >
        {isPending ? 'Saving…' : 'Go to Dashboard →'}
      </button>
    </div>
  )
}
