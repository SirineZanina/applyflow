import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { useUpsertProfile } from '@/features/profile/hooks'
import {
  EMPTY_WIZARD_DATA,
  EXPERIENCE_TO_YEARS,
  STEP_LABELS,
  TOTAL_STEPS,
  WORK_STYLE_TO_REMOTE,
  type WizardData,
} from '../types'
import { Step1Basics } from './Step1Basics'
import { Step2Skills } from './Step2Skills'
import { Step3Preferences } from './Step3Preferences'
import { Step4Resume } from './Step4Resume'
import { Step5Done } from './Step5Done'

const STEP_META = [
  { title: "Let's set up your profile", subtitle: 'This helps us find the best job matches for you.' },
  { title: 'What are your key skills?', subtitle: 'Add the tools, languages, and frameworks you know.' },
  { title: 'What kind of role are you after?', subtitle: "We'll filter job matches and auto-apply based on this." },
  { title: 'Upload your current resume', subtitle: "We'll parse it to pre-fill your profile and boost match scores." },
  { title: "You're all set!", subtitle: "ApplyFlow is ready. Let's find your next role." },
] as const

const STEP_PROGRESS_CLASS = ['w-1/5', 'w-2/5', 'w-3/5', 'w-4/5', 'w-full'] as const

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>
      <span className="text-[17px] font-extrabold tracking-[-0.03em] text-foreground">
        ApplyFlow
      </span>
    </div>
  )
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? 'w-5' : 'w-1.5'
          } ${i <= current ? 'bg-primary' : 'bg-border'}`}
        />
      ))}
    </div>
  )
}

export function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>(EMPTY_WIZARD_DATA)

  const user = useAuthStore((s) => s.user)
  const upsert = useUpsertProfile()
  const router = useRouter()

  const fullName = user ? `${user.firstName} ${user.lastName}` : ''

  function patch(partial: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...partial }))
  }

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0))
  }

  function finish() {
    upsert.mutate(
      {
        headline: data.headline || null,
        summary: null,
        yearsExperience: EXPERIENCE_TO_YEARS[data.experience],
        desiredRoles: data.roles,
        desiredLocations: data.location ? [data.location] : [],
        skills: data.skills,
        companySizes: data.companySizes,
        remotePreference: WORK_STYLE_TO_REMOTE[data.workStyle],
        salaryMin: data.salaryMin * 1000,
        salaryMax: data.salaryMax * 1000,
        currency: 'EUR',
      },
      { onSuccess: () => router.navigate({ to: '/dashboard' }) },
    )
  }

  const { title, subtitle } = STEP_META[step]
  const isLastStep = step === TOTAL_STEPS - 1

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-8 font-sans">
      <div className="w-full max-w-xl">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <div className="text-xs font-semibold text-muted-foreground">
            Step {step + 1} of {TOTAL_STEPS}
          </div>
        </div>

        <div className="mb-9 h-1 overflow-hidden rounded-full bg-border">
          <div className={`h-full rounded-full bg-primary transition-all duration-300 ${STEP_PROGRESS_CLASS[step]}`} />
        </div>

        <div className="rounded-2xl border border-border bg-card px-9 py-8 shadow-sm">
          <div className="mb-6">
            <h2 className="mb-1 text-xl font-extrabold tracking-[-0.03em] text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {step === 0 && <Step1Basics data={data} fullName={fullName} onChange={patch} />}
          {step === 1 && <Step2Skills data={data} onChange={patch} />}
          {step === 2 && <Step3Preferences data={data} onChange={patch} />}
          {step === 3 && <Step4Resume onSkip={next} onUploaded={next} />}
          {step === 4 && (
            <Step5Done
              data={data}
              fullName={fullName}
              onFinish={finish}
              isPending={upsert.isPending}
            />
          )}

          {!isLastStep && (
            <div className="mt-6 flex gap-2.5">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={back}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-muted-foreground"
                >
                  ← Back
                </Button>
              )}
              <Button
                onClick={next}
                className="flex-1 rounded-lg px-5 py-3 text-sm font-bold"
              >
                {step === TOTAL_STEPS - 2 ? 'Finish setup →' : 'Continue →'}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6">
          <StepDots current={step} total={TOTAL_STEPS} />
        </div>

        <div className="flex justify-between px-1 pt-2">
          {STEP_LABELS.map((label, i) => (
            <span
              key={label}
              className={`text-[11px] ${i === step ? 'font-semibold text-primary' : 'font-normal text-muted-foreground'}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
