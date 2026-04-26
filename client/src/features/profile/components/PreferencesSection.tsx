import { Controller, type Control, type FieldErrors, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { CURRENCY_LEN } from '@/lib/validation/constants'
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
        <Label className="text-xs font-semibold text-muted-foreground">Work Style</Label>
        <Controller
          name="remotePreference"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {REMOTE_OPTIONS.map((option) => {
                const active = field.value === option.value
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="ghost"
                    onClick={() => field.onChange(active ? null : option.value)}
                    className={`h-auto rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-transparent ${
                      active
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {option.label}
                  </Button>
                )
              })}
            </div>
          )}
        />
      </div>

      <div className="mb-4 space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground">Salary Range</Label>
        <div className="flex items-center gap-2.5">
          <span className="w-12 text-xs font-bold text-primary">{formatK(salaryMin)}</span>
          <Controller
            name="salaryMin"
            control={control}
            render={({ field }) => (
              <Slider
                min={0}
                max={300000}
                step={5000}
                value={[Number(field.value) || 0]}
                onValueChange={(values) => field.onChange(values[0] ?? 0)}
                className="flex-1"
              />
            )}
          />
          <Controller
            name="salaryMax"
            control={control}
            render={({ field }) => (
              <Slider
                min={0}
                max={300000}
                step={5000}
                value={[Number(field.value) || 300000]}
                onValueChange={(values) => field.onChange(values[0] ?? 300000)}
                className="flex-1"
              />
            )}
          />
          <span className="w-12 text-right text-xs font-bold text-primary">{formatK(salaryMax)}</span>
        </div>
        {errors.salaryMin ? <p className="text-xs text-danger">{errors.salaryMin.message}</p> : null}
      </div>

      <div className="mb-4 space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground">Company Size</Label>
        <Controller
          name="companySizes"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {COMPANY_SIZE_OPTIONS.map((option) => {
                const active = field.value.includes(option)
                return (
                  <Button
                    key={option}
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      field.onChange(
                        active
                          ? field.value.filter((value) => value !== option)
                          : [...field.value, option],
                      )
                    }
                    className={`h-auto rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-transparent ${
                      active
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {option}
                  </Button>
                )
              })}
            </div>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="currency" className="text-xs font-semibold text-muted-foreground">
          Currency
        </Label>
        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <Input
              id="currency"
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="EUR"
              maxLength={CURRENCY_LEN}
              className="h-8 w-20 text-xs uppercase"
            />
          )}
        />
        {errors.currency ? <p className="text-xs text-danger">{errors.currency.message}</p> : null}
      </div>
    </ProfileSection>
  )
}
