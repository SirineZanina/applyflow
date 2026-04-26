import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { MATCH_PERCENT_MAX, MATCH_PERCENT_MIN, ROLE_TYPES_MAX } from '@/lib/validation/constants'

export const ROLE_OPTIONS = [
  'Frontend Engineer',
  'Full Stack Engineer',
  'Backend Engineer',
  'Staff / Lead Engineer',
  'Product Designer',
  'Product Manager',
  'Data Engineer',
  'DevOps / Platform',
] as const

interface Props {
  minMatch: number
  remoteOnly: boolean
  selectedRoles: string[]
  onMinMatchChange: (value: number) => void
  onRemoteOnlyChange: (value: boolean) => void
  onToggleRole: (role: string) => void
}

export function JobFilters({
  minMatch,
  remoteOnly,
  selectedRoles,
  onMinMatchChange,
  onRemoteOnlyChange,
  onToggleRole,
}: Readonly<Props>) {
  return (
    <aside className="h-fit rounded-xl border border-border bg-card p-4">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        Filters
      </p>

      <div className="mb-4">
        <Label htmlFor="min-match" className="mb-2 block text-xs font-semibold text-foreground">
          Min Match Score
        </Label>
        <Slider
          id="min-match"
          min={MATCH_PERCENT_MIN}
          max={MATCH_PERCENT_MAX - 5}
          step={5}
          value={[minMatch]}
          onValueChange={(values) => onMinMatchChange(values[0] ?? minMatch)}
          className="w-full"
        />
        <p className="mt-1 text-xs font-bold text-primary">{minMatch}%+</p>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Checkbox
          id="remote-only"
          checked={remoteOnly}
          onCheckedChange={(checked) => onRemoteOnlyChange(checked === true)}
        />
        <Label htmlFor="remote-only" className="text-xs font-semibold text-foreground">
          Remote only
        </Label>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-semibold text-foreground">
          Role Type{selectedRoles.length >= ROLE_TYPES_MAX ? ` (max ${ROLE_TYPES_MAX})` : ''}
        </legend>
        <div className="space-y-1.5">
          {ROLE_OPTIONS.map((role) => (
            <div key={role} className="flex items-start gap-2">
              <Checkbox
                id={`role-${role}`}
                checked={selectedRoles.includes(role)}
                onCheckedChange={() => onToggleRole(role)}
                className="mt-0.5"
              />
              <Label htmlFor={`role-${role}`} className="text-xs text-muted-foreground">
                {role}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>
    </aside>
  )
}
