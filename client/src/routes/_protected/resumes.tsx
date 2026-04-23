import { createFileRoute } from '@tanstack/react-router'
import { ResumePage } from '@/features/resume/components/ResumePage'

export const Route = createFileRoute('/_protected/resumes')({
  component: ResumePage,
})
