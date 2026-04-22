import { createFileRoute } from '@tanstack/react-router'
import { SignInForm } from '@/features/auth/components/SignInForm'

export const Route = createFileRoute('/_auth/sign-in')({
  component: SignInForm,
})
