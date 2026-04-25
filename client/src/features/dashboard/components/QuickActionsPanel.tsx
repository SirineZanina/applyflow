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
        <button
          key={label}
          className="flex w-full cursor-pointer items-center justify-between border-0 border-b border-border bg-transparent py-2.5 text-left text-[13px] font-medium text-foreground"
        >
          {label}
          <span className="text-primary">→</span>
        </button>
      ))}
    </div>
  );
}
