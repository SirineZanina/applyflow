import { useEffect } from 'react'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileInput } from '../schema'
import { useProfile, useUpsertProfile } from '../hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const REMOTE_OPTIONS = [
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ON_SITE', label: 'On site' },
  { value: 'FLEXIBLE', label: 'Flexible' },
] as const

export function ProfileForm() {
  const { data: profile, isLoading } = useProfile()
  const upsert = useUpsertProfile()

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileInput>,
    defaultValues: {
      headline: null,
      summary: null,
      yearsExperience: null,
      desiredRoles: [],
      desiredLocations: [],
      remotePreference: null,
      salaryMin: null,
      salaryMax: null,
      currency: null,
    },
  })

  useEffect(() => {
    if (profile) reset({
      headline: profile.headline,
      summary: profile.summary,
      yearsExperience: profile.yearsExperience,
      desiredRoles: profile.desiredRoles,
      desiredLocations: profile.desiredLocations,
      remotePreference: profile.remotePreference,
      salaryMin: profile.salaryMin,
      salaryMax: profile.salaryMax,
      currency: profile.currency,
    })
  }, [profile, reset])

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>

  return (
    <form onSubmit={handleSubmit((data) => upsert.mutate(data,{
        onSuccess: (updated) => reset({
            headline: updated.headline,
            summary: updated.summary,
            yearsExperience: updated.yearsExperience,
            desiredRoles: updated.desiredRoles,
            desiredLocations: updated.desiredLocations,
            remotePreference: updated.remotePreference,
            salaryMin: updated.salaryMin,
            salaryMax: updated.salaryMax,
            currency: updated.currency,
        }),
    }))} className="space-y-6 max-w-2xl">

      <div className="space-y-1">
        <Label htmlFor="headline">Headline</Label>
        <Controller name="headline" control={control} render={({ field }) =>
          <Input id="headline" placeholder="e.g. Senior Full-Stack Engineer" {...field} value={field.value ?? ''} />
        } />
        {errors.headline && <p className="text-sm text-destructive">{errors.headline.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="summary">Summary</Label>
        <Controller name="summary" control={control} render={({ field }) =>
          <textarea
            id="summary"
            rows={4}
            placeholder="Brief professional summary..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...field}
            value={field.value ?? ''}
          />
        } />
      </div>

      <div className="space-y-1">
        <Label htmlFor="yearsExperience">Years of experience</Label>
        <Controller name="yearsExperience" control={control} render={({ field }) =>
          <Input id="yearsExperience" type="number" min={0} max={50} {...field} value={field.value ?? ''} />
        } />
        {errors.yearsExperience && <p className="text-sm text-destructive">{errors.yearsExperience.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="salaryMin">Salary min</Label>
          <Controller name="salaryMin" control={control} render={({ field }) =>
            <Input id="salaryMin" type="number" min={0} {...field} value={field.value ?? ''} />
          } />
          {errors.salaryMin && <p className="text-sm text-destructive">{errors.salaryMin.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="salaryMax">Salary max</Label>
          <Controller name="salaryMax" control={control} render={({ field }) =>
            <Input id="salaryMax" type="number" min={0} {...field} value={field.value ?? ''} />
          } />
          {errors.salaryMax && <p className="text-sm text-destructive">{errors.salaryMax.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="currency">Currency</Label>
        <Controller name="currency" control={control} render={({ field }) =>
          <Input id="currency" placeholder="EUR" maxLength={3} {...field} value={field.value ?? ''} />
        } />
        {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="remotePreference">Remote preference</Label>
        <Controller name="remotePreference" control={control} render={({ field }) =>
          <select
            id="remotePreference"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...field}
            value={field.value ?? ''}
          >
            <option value="">Select preference</option>
            {REMOTE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        } />
      </div>
      
    <Button type="submit" disabled={upsert.isPending || !isDirty}>
        {upsert.isPending ? 'Saving...' : 'Save profile'}
    </Button>

      {upsert.isSuccess && <p className="text-sm text-green-600">Profile saved.</p>}
      {upsert.isError && <p className="text-sm text-destructive">Failed to save profile.</p>}

    </form>
  )
}
