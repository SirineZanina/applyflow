import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { RouteError } from '@/components/layout/RouteError'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
  errorComponent: RouteError,
})
