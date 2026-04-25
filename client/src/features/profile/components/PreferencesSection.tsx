import { Controller, type Control, type FieldErrors, useWatch } from 'react-hook-form'
import type { ProfileInput } from '../schema'
import { ProfileSection } from './ProfileSection'

const REMOTE_OPTIONS = [
  { value: 'REMOTE' as const, label: 'Remote' },
  { value: 'HYBRID' as const, label: 'Hybrid' },
  { value: 'ON_SITE' as const, label: 'On-site' },
  { value: 'FLEXIBLE' as const, label: 'Flexible' },
]

const COMPANY_SIZE_OPTIONS = [
  'Startup (1–50)',
  'Scale-up (50–500)',
  'Mid-size (500–5K)',
  'Enterprise (5K+)',
]

function formatK(value: number | null | undefined) {
  if (value === null || value === undefined) return '$0K'
  return `$${Math.round(value / 1000)}K`
}

interface Props {
  control: Control<ProfileInput>
  errors: FieldErrors<ProfileInput>
}

export function PreferencesSection({ control, errors }: Readonly<Props>) {
  const salaryMin = useWatch({ control, name: 'salaryMin' })
  const salaryMax = useWatch({ control, name: 'salaryMax' })

  return (
    <ProfileSection title="Job Preferences">
      <div className="mb-4 space-y-2">
        <label className="text-xs font-semibold text-muted-foreground">Work Style</label>
        <Controller
          name="remotePreference"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {REMOTE_OPTIONS.map((option) => {
                const active = field.value === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(active ? null : option.value)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                      active
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          )}
        />
      </div>

      <div className="mb-4 space-y-2">
        <label className="text-xs font-semibold text-muted-foreground">Salary Range</label>
        <div className="flex items-center gap-2.5">
          <span className="w-12 text-xs font-bold text-primary">{formatK(salaryMin)}</span>
          <Controller
            name="salaryMin"
            control={control}
            render={({ field }) => (
              <input
                type="range"
                min={0}
                max={300000}
                step={5000}
                value={Number(field.value) || 0}
                onChange={(event) => field.onChange(Number(event.target.value))}
                className="flex-1 accent-primary"
              />
            )}
          />
          <Controller
            name="salaryMax"
            control={control}
            render={({ field }) => (
              <input
                type="range"
                min={0}
                max={300000}
                step={5000}
                value={Number(field.value) || 300000}
                onChange={(event) => field.onChange(Number(event.target.value))}
                className="flex-1 accent-primary"
              />
            )}
          />
          <span className="w-12 text-right text-xs font-bold text-primary">{formatK(salaryMax)}</span>
        </div>
        {errors.salaryMin ? <p className="text-xs text-danger">{errors.salaryMin.message}</p> : null}
      </div>

      <div className="mb-4 space-y-2">
        <label className="text-xs font-semibold text-muted-foreground">Company Size</label>
        <Controller
          name="companySizes"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {COMPANY_SIZE_OPTIONS.map((option) => {
                const active = field.value.includes(option)
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      field.onChange(
                        active
                          ? field.value.filter((value) => value !== option)
                          : [...field.value, option],
                      )
                    }
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                      active
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="currency" className="text-xs font-semibold text-muted-foreground">
          Currency
        </label>
        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <input
              id="currency"
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="EUR"
              maxLength={3}
              className="h-8 w-20 rounded-md border border-input bg-background px-2 text-xs uppercase"
            />
          )}
        />
        {errors.currency ? <p className="text-xs text-danger">{errors.currency.message}</p> : null}
      </div>
    </ProfileSection>
  )
}
