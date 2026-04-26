import { Button } from "@/components/ui/button";

export function AutoApplyCTA() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-primary p-5">
      {/* Decorative circle — from design */}
      <div className="absolute -top-5 -right-5 h-20 w-20 rounded-full bg-white/8" />
      <h3 className="mb-1.5 text-sm font-bold text-white">
        Auto-Apply is ready
      </h3>
      <p className="mb-3.5 text-xs text-white/75">
        Complete your profile to unlock AI job applications.
      </p>
      <Button
        variant="ghost"
        className="h-auto rounded-[7px] bg-white px-3.5 py-2 text-xs font-bold text-primary hover:bg-white/90"
      >
        Set up profile
      </Button>
    </div>
  );
}
