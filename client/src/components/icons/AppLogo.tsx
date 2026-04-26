import { BoltIcon } from "./BoltIcon";

export function AppLogo({ dark = false }: { readonly dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.25">
      <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary">
        <BoltIcon size={16} color="white" />
      </div>
      <span className={`text-[17px] font-extrabold tracking-[-0.03em] ${dark ? "text-white" : "text-foreground"}`}>
        ApplyFlow
      </span>
    </div>
  );
}