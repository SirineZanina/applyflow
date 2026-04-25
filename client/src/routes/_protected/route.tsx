import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { RouteError } from '@/components/layout/RouteError'
import { getProfile } from '@/features/profile/api'
import { profileKeys } from '@/features/profile/hooks'
import { getAuthState } from '@/stores/auth.store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ context: { queryClient } }) => {
    if (!getAuthState().accessToken) {
      throw redirect({ to: '/sign-in' })
    }

    // Use synchronous cache if available — avoids a network request on every navigation
    const cached = queryClient.getQueryData(profileKeys.me())
    if (cached === undefined) {
      // First load: fetch profile to determine onboarding status
      const profile = await queryClient.fetchQuery({
        queryKey: profileKeys.me(),
        queryFn: getProfile,
        staleTime: 5 * 60 * 1000,
      })
      if (!profile) throw redirect({ to: '/onboarding' })
    } else if (cached === null) {
      throw redirect({ to: '/onboarding' })
    }
  },
  component: ProtectedLayout,
  errorComponent: RouteError,
})
