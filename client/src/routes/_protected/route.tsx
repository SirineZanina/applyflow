import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { getAuthState } from '@/stores/auth.store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected')({
    beforeLoad: () => {
        if (!getAuthState().accessToken) {
            throw redirect({ to: '/sign-in'})
        }
    },
    component: ProtectedLayout,
})