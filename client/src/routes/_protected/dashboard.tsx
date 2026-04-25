import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/features/dashboard/components/DashboardPage'
import { RouteError } from '@/components/layout/RouteError'

export const Route = createFileRoute('/_protected/dashboard')({
  component: DashboardPage,
  errorComponent: RouteError,
})
