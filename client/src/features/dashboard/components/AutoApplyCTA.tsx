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
      <button
        className="cursor-pointer rounded-[7px] border-0 bg-white px-3.5 py-2 text-xs font-bold text-primary"
      >
        Set up profile
      </button>
    </div>
  );
}
