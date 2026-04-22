import { getAuthState } from '@/stores/auth.store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      to: getAuthState().accessToken ? '/dashboard' : '/sign-in',
    })
  },
})