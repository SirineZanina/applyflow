import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth.store'
import { profileSchema, type ProfileInput } from '../schema'
import { useProfile, useUpsertProfile } from '../hooks'
import { PersonalInfoSection } from './PersonalInfoSection'
import { PreferencesSection } from './PreferencesSection'
import { SkillsSection } from './SkillsSection'

function LoadingSkeleton() {
  return (
    <div className="max-w-[700px] space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-54 rounded-xl" />
      ))}
    </div>
  )
}

function toFormValues(profile: NonNullable<ReturnType<typeof useProfile>['data']>): ProfileInput {
  return {
    headline: profile.headline,
    summary: profile.summary,
    yearsExperience: profile.yearsExperience,
    desiredRoles: profile.desiredRoles ?? [],
    desiredLocations: profile.desiredLocations ?? [],
    skills: profile.skills ?? [],
    companySizes: profile.companySizes ?? [],
    remotePreference: profile.remotePreference,
    salaryMin: profile.salaryMin,
    salaryMax: profile.salaryMax,
    currency: profile.currency,
  }
}

export function ProfileForm() {
  const user = useAuthStore((state) => state.user)
  const { data: profile, isLoading } = useProfile()
  const upsert = useUpsertProfile()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileInput>,
    defaultValues: {
      headline: null,
      summary: null,
      yearsExperience: null,
      desiredRoles: [],
      desiredLocations: [],
      skills: [],
      companySizes: [],
      remotePreference: null,
      salaryMin: null,
      salaryMax: null,
      currency: null,
    },
  })

  useEffect(() => {
    if (profile) {
      reset(toFormValues(profile))
    }
  }, [profile, reset])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <form
      onSubmit={handleSubmit((values) =>
        upsert.mutate(values, {
          onSuccess: (updated) => reset(toFormValues(updated)),
        }),
      )}
      className="max-w-[700px]"
    >
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">
            Profile & Preferences
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Used to match jobs and generate your documents.
          </p>
        </div>
        <Button
          type="submit"
          className="h-9 px-4 text-xs font-bold"
          disabled={upsert.isPending || !isDirty}
        >
          {upsert.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </header>

      <PersonalInfoSection control={control} errors={errors} user={user} />
      <SkillsSection control={control} />
      <PreferencesSection control={control} errors={errors} />
    </form>
  )
}
