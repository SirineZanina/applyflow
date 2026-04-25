import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { AuthUser } from '@/types/auth'
import type { ProfileInput } from '../schema'
import { ProfileSection } from './ProfileSection'

interface Props {
  control: Control<ProfileInput>
  errors: FieldErrors<ProfileInput>
  user: AuthUser | null
}

export function PersonalInfoSection({ control, errors, user }: Readonly<Props>) {
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'ApplyFlow User'

  return (
    <ProfileSection title="Personal Info">
      <div className="mb-4 flex items-center gap-3.5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-extrabold text-primary-foreground">
          {initials || 'AF'}
        </div>
        <div>
          <p className="text-[15px] font-bold text-foreground">{fullName}</p>
          <p className="text-xs text-muted-foreground">{user?.email ?? 'No email'}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="headline" className="text-xs font-semibold text-muted-foreground">
            Current Title
          </label>
          <Controller
            name="headline"
            control={control}
            render={({ field }) => (
              <Input
                id="headline"
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="h-9"
              />
            )}
          />
          {errors.headline ? <p className="text-xs text-danger">{errors.headline.message}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="experience" className="text-xs font-semibold text-muted-foreground">
            Years of Experience
          </label>
          <Controller
            name="yearsExperience"
            control={control}
            render={({ field }) => (
              <Input
                id="experience"
                type="number"
                min={0}
                max={50}
                value={field.value ?? ''}
                onChange={field.onChange}
                className="h-9"
              />
            )}
          />
          {errors.yearsExperience ? (
            <p className="text-xs text-danger">{errors.yearsExperience.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Email</label>
          <Input value={user?.email ?? ''} readOnly className="h-9 opacity-60" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="locations" className="text-xs font-semibold text-muted-foreground">
            Preferred Locations
          </label>
          <Controller
            name="desiredLocations"
            control={control}
            render={({ field }) => (
              <Input
                id="locations"
                value={field.value?.join(', ') ?? ''}
                onChange={(event) =>
                  field.onChange(
                    event.target.value
                      .split(',')
                      .map((value) => value.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="Tunis, Remote, Paris"
                className="h-9"
              />
            )}
          />
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <label htmlFor="summary" className="text-xs font-semibold text-muted-foreground">
          Professional Summary
        </label>
        <Controller
          name="summary"
          control={control}
          render={({ field }) => (
            <Textarea
              id="summary"
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="Brief professional summary..."
              className="min-h-24"
            />
          )}
        />
      </div>
    </ProfileSection>
  )
}
