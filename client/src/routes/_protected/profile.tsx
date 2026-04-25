import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/features/profile/components/ProfilePage'
import { RouteError } from '@/components/layout/RouteError'

export const Route = createFileRoute('/_protected/profile')({
  component: ProfilePage,
  errorComponent: RouteError,
})
