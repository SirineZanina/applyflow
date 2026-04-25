import { Link } from '@tanstack/react-router'
import {
  Bot,
  Briefcase,
  FileStack,
  LayoutDashboard,
  type LucideIcon,
  LogOut,
  Sparkles,
  User,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSignOut } from '@/features/auth/hooks'
import { useProfile } from '@/features/profile/hooks'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'

const NAV_ITEMS: ReadonlyArray<{
  to: '/dashboard' | '/jobs' | '/tracker' | '/auto-apply' | '/documents' | '/profile'
  label: string
  icon: LucideIcon
  accent?: boolean
}> = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Job Search', icon: Briefcase },
  { to: '/tracker', label: 'Tracker', icon: Sparkles },
  { to: '/auto-apply', label: 'Auto-Apply', icon: Bot, accent: true },
  { to: '/documents', label: 'Documents', icon: FileStack },
  { to: '/profile', label: 'Profile', icon: User },
] as const

function BoltIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

export function Sidebar() {
  const signOut = useSignOut()
  const user = useAuthStore((state) => state.user)
  const { data: profile } = useProfile()

  const initials = user
    ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
    : 'AF'

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-56 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <BoltIcon />
        </div>
        <span className="text-base font-bold tracking-[-0.02em] text-foreground">
          ApplyFlow
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, accent }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors',
              'hover:bg-muted hover:text-foreground',
              accent &&
                'bg-primary-light text-primary hover:bg-primary-light hover:text-primary',
              'aria-[current=page]:bg-primary-light aria-[current=page]:font-semibold aria-[current=page]:text-primary',
            )}
          >
            <Icon size={18} />
            <span>{label}</span>
            {accent ? (
              <Badge className="ml-auto h-4 rounded-lg bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                AI
              </Badge>
            ) : null}
          </Link>
        ))}
      </nav>

      <footer className="mt-auto border-t border-sidebar-border px-4 pt-4 pb-5">
        <div className="mb-2.5 flex items-center gap-2.5">
          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-foreground">
              {user ? `${user.firstName} ${user.lastName}` : 'ApplyFlow User'}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {profile?.headline ?? 'Candidate'}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full justify-start gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-muted-foreground hover:text-foreground"
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
        >
          <LogOut size={15} />
          Sign out
        </Button>
      </footer>
    </aside>
  )
}
