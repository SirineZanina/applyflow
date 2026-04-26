import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EXPERIENCE_OPTIONS, type ExperienceOption, type WizardData } from '../types'

const fieldClassName =
  'h-10 w-full rounded-lg border border-border bg-card px-3 text-[13.5px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary'

interface Props {
  data: WizardData
  fullName: string
  onChange: (patch: Partial<WizardData>) => void
}

export function Step1Basics({ data, fullName, onChange }: Props) {
  return (
    <div>
      <div className="mb-3.5">
        <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Full Name</Label>
        <Input
          value={fullName}
          disabled
          className="h-10 rounded-lg border-border bg-card text-[13.5px] text-foreground opacity-60"
        />
      </div>

      <div className="mb-3.5">
        <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Current or Most Recent Title
        </Label>
        <Input
          className="h-10"
          placeholder="e.g. Senior Frontend Engineer"
          value={data.headline}
          onChange={(e) => onChange({ headline: e.target.value })}
        />
      </div>

      <div className="mb-3.5 grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Location</Label>
          <Input
            className="h-10"
            placeholder="San Francisco, CA"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Experience</Label>
          <select
            value={data.experience}
            onChange={(e) => onChange({ experience: e.target.value as ExperienceOption })}
            className={`${fieldClassName} cursor-pointer`}
          >
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
