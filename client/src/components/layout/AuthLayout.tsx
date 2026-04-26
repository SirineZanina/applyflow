import { Outlet, useRouterState } from "@tanstack/react-router";
import { AppLogo } from "../icons";

const FEATURES = [
  { emoji: "⚡", title: "Auto-Apply",      description: "AI applies to hundreds of jobs while you sleep" },
  { emoji: "✦",  title: "Smart Matching",  description: "Get match scores for every job opening" },
  { emoji: "◎",  title: "Tailored CVs",    description: "Every application gets a personalized resume" },
  { emoji: "→",  title: "Track Everything", description: "Kanban board for your entire job search" },
] as const;

function LeftPanel() {
  return (
    <div className="relative hidden w-105 shrink-0 flex-col justify-between overflow-hidden bg-primary p-12 text-white lg:flex">
      <div className="absolute -top-16 -right-16 h-60 w-60 rounded-full bg-white/6" />
      <div className="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-white/5" />

      <div className="relative">
        <AppLogo dark />
      </div>

      <div className="relative space-y-9">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight tracking-[-0.03em] text-white">
            Your job search,<br />on autopilot.
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-white/70">
            From discovery to offer — ApplyFlow handles every step with AI.
          </p>
        </div>

        <ul className="space-y-4">
          {FEATURES.map(({ emoji, title, description }) => (
            <li key={title} className="flex items-start gap-3">
              <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[9px] bg-white/12 text-sm">
                {emoji}
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">{title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-white/60">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-[12px] text-white/45">
        Trusted by 14,000+ job seekers · 200K+ applications sent
      </p>
    </div>
  );
}

interface RightPanelProps {
  readonly title: string;
  readonly description: string;
}

function RightPanel({  title, description }: RightPanelProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-115">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <AppLogo />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground">
            {title}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <Outlet />
      </div>
    </div>
  );
}

export function AuthLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isSignUp = pathname.includes("sign-up");

  return (
    <div className="flex min-h-svh bg-background">
      <LeftPanel />
      <RightPanel
        title={isSignUp ? "Create your account" : "Welcome back"}
        description={
          isSignUp
            ? "Start your AI-powered job search today — free."
            : "Sign in to your ApplyFlow account"
        }
      />
    </div>
  );
}
