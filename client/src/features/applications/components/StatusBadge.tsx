import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "../types";

const STATUS_CONFIG = {
  SAVED: {
    label: "Saved",
    className: "bg-muted text-muted-foreground",
  },
  APPLIED: {
    label: "Applied",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  INTERVIEWING: {
    label: "Interviewing",
    className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  },
  OFFER: {
    label: "Offer",
    className: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "bg-muted text-muted-foreground",
  },
} as const satisfies Record<
  ApplicationStatus,
  { label: string; className: string }
>;

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: Readonly<StatusBadgeProps>) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}