import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { getAuthState } from '@/stores/auth.store'
import { fetchMe } from '@/lib/api/me'
import { BASE_URL } from '@/lib/api/config'
import { RouteError } from '@/components/layout/RouteError'
import { NotFoundPage } from '@/components/layout/NotFoundPage'

interface RouterContext {
  queryClient: QueryClient
}

async function restoreSession() {
  if (getAuthState().accessToken) return
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) return
    const { access_token } = await res.json()
    const user = await fetchMe(access_token)
    if (user) getAuthState().setSession(access_token, user)
  } catch {
    // no valid cookie — user stays unauthenticated
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: restoreSession,
  component: () => <Outlet />,
  errorComponent: RouteError,
  notFoundComponent: NotFoundPage,
})
