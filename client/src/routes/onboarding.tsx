import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAuthState } from '@/stores/auth.store'
import { profileKeys } from '@/features/profile/hooks'
import { OnboardingWizard } from '@/features/onboarding/components/OnboardingWizard'
import { RouteError } from '@/components/layout/RouteError'

export const Route = createFileRoute('/onboarding')({
  beforeLoad: async ({ context: { queryClient } }) => {
    // Onboarding requires authentication
    if (!getAuthState().accessToken) {
      throw redirect({ to: '/sign-in' })
    }
    // If profile already exists skip onboarding
    const cached = queryClient.getQueryData(profileKeys.me())
    if (cached) throw redirect({ to: '/dashboard' })
  },
  component: OnboardingWizard,
  errorComponent: RouteError,
})
