import { Button } from "@/components/ui/button";

const ACTIONS = [
  "Complete your profile",
  "Upload your first resume",
  "Add new documents",
] as const;

export function QuickActionsPanel() {
  return (
    <div className="rounded-xl border border-border bg-card p-4.5">
      <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[0.05em] text-foreground">
        Quick Actions
      </h3>
      {ACTIONS.map((label) => (
        <Button
          key={label}
          variant="ghost"
          className="flex h-auto w-full items-center justify-between border-b border-border py-2.5 text-left text-[13px] font-medium text-foreground hover:bg-transparent"
        >
          {label}
          <span className="text-primary">→</span>
        </Button>
      ))}
    </div>
  );
}
