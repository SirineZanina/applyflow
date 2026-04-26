const COMPANY_LOGO_BG_CLASSES = [
  "bg-primary",
  "bg-success",
  "bg-danger",
  "bg-foreground",
  "bg-muted-foreground",
] as const;

export function companyLogoBgClass(companyName: string): string {
  const hash = Array.from(companyName).reduce(
    (acc, char) => acc + (char.codePointAt(0) ?? 0),
    0,
  );
  return COMPANY_LOGO_BG_CLASSES[hash % COMPANY_LOGO_BG_CLASSES.length];
}

export function matchTone(score: number): string {
  if (score >= 90) return "bg-success-light text-success";
  if (score >= 80) return "bg-primary-light text-primary";
  if (score >= 70) return "bg-warning-light text-warning";
  return "bg-border text-muted-foreground";
}

export function salaryLabel(
  min: number | null,
  max: number | null,
  currency: string | null,
): string {
  if (min === null && max === null) return null as unknown as string;
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  if (min !== null && max !== null)
    return `${sym}${Math.round(min / 1000)}K–${sym}${Math.round(max / 1000)}K`;
  if (min !== null) return `From ${sym}${Math.round(min / 1000)}K`;
  return `Up to ${sym}${Math.round((max ?? 0) / 1000)}K`;
}

export function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
}
