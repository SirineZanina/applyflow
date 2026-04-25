interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  valueClassName?: string;
}

function StatCard({ label, value, sub, valueClassName = 'text-foreground' }: Readonly<StatCardProps>) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-card px-5 py-4.5">
      <div className="mb-1.5 text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
        {label}
      </div>
      <div className={`text-[32px] leading-none font-extrabold tracking-[-0.03em] ${valueClassName}`}>
        {value}
      </div>
      {sub && (
        <div className="mt-1.5 text-xs text-muted-foreground">
          {sub}
        </div>
      )}
    </div>
  );
}

interface StatCardsProps {
  resumeCount: number;
}

export function StatCards({ resumeCount }: Readonly<StatCardsProps>) {
  return (
    <div className="mb-7 flex gap-3.5">
      <StatCard label="Applied" value={0} sub="this month" />
      <StatCard label="Interviews" value={0} sub="active" valueClassName="text-primary" />
      <StatCard label="Offers" value={0} sub="pending review" valueClassName="text-success" />
      <StatCard label="Resumes" value={resumeCount} sub="uploaded" />
    </div>
  );
}
