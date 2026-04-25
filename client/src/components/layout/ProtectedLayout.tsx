import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'

export function ProtectedLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <Sidebar />
      <main className="min-h-svh px-5 py-6 lg:ml-56 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}
