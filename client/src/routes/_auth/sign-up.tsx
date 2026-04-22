import { createFileRoute } from '@tanstack/react-router'
import { SignUpForm } from '@/features/auth/components/SignUpForm'

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUpForm,
})
