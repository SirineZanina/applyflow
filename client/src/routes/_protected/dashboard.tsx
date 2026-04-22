import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/dashboard') ({
    component: () => <div>Dashboard</div>,
})