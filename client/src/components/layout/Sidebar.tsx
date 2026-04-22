import { Link } from "@tanstack/react-router";
import { LayoutDashboard, FileText, LogOut, User } from "lucide-react";
import { useSignOut } from "@/features/auth/hooks";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
    {
        icon: LayoutDashboard,
        label: "Dashboard",
        to: "/dashboard"
    },
    {
        icon: FileText,
        label: "Applications",
        to: "/applications"
    },
    {
        icon: User,
        label: "Profile",
        to: "/profile"
    }
] as const;

export function Sidebar() {
    const signOut = useSignOut();

    return (
        <aside className="flex h-screen w-60 flex-col border-r bg-background p-4">
            <div className="mb-8 px-2">
                <span className="text-lg font-semibold tracking-tight">
                    ApplyFlow
                </span>
            </div>
            <nav className="flex flex-1 flex-col gap-1">
                {NAV_ITEMS.map(({ to, label, icon: Icon}) => (
                    <Link
                        key={to}
                        to={to}
                        className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground [&.active]:font-medium"
                    >
                        <Icon size={16} />
                        {label}
                    </Link>
                ))}
            </nav>

            <Button
                variant="ghost"
                className="justify-start gap-3 text-muted-foreground"
                onClick={() => signOut.mutate()}
                disabled={signOut.isPending}
            >
                <LogOut size={16} />
                Sign Out
            </Button>
        </aside>
    )
}
