import { createFileRoute } from '@tanstack/react-router'
  import { ProfilePage } from '@/features/profile/components/ProfilePage'

  export const Route = createFileRoute('/_protected/profile')({
    component: ProfilePage,
  })