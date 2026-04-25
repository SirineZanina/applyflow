interface Props {
  profileComplete: boolean;
}

export function TopMatchesSection({ profileComplete }: Readonly<Props>) {
  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-foreground">
          Today's Top Matches
        </h2>
      </div>

      {/* Phase 2 placeholder — replace with real job cards */}
      <div className="rounded-xl border border-border bg-card px-6 py-8 text-center">
        <p className="text-[13px] text-muted-foreground">
          Job matching launches in Phase 2.{" "}
          {!profileComplete && "Complete your profile to be ready."}
        </p>
      </div>
    </div>
  );
}
