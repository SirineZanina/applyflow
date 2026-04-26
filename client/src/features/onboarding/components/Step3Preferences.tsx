import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  COMPANY_SIZES,
  ROLE_OPTIONS,
  WORK_STYLES,
  type WizardData,
  type WorkStyle,
} from '../types'

const sectionLabelClassName =
  'mb-2.5 block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground'

interface TogglePillProps {
  label: string
  active: boolean
  onClick: () => void
}

function TogglePill({ label, active, onClick }: TogglePillProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`h-auto rounded-md border px-3 py-1.5 text-xs transition-all hover:bg-transparent ${
        active
          ? 'border-primary bg-primary-light font-bold text-primary'
          : 'border-border font-medium text-muted-foreground'
      }`}
    >
      {label}
    </Button>
  )
}

interface Props {
  data: WizardData
  onChange: (patch: Partial<WizardData>) => void
}

export function Step3Preferences({ data, onChange }: Props) {
  function toggleRole(role: string) {
    onChange({
      roles: data.roles.includes(role)
        ? data.roles.filter((r) => r !== role)
        : [...data.roles, role],
    })
  }

  function toggleCompanySize(size: string) {
    onChange({
      companySizes: data.companySizes.includes(size)
        ? data.companySizes.filter((s) => s !== size)
        : [...data.companySizes, size],
    })
  }

  return (
    <div>
      <div className="mb-4">
        <span className={sectionLabelClassName}>Role Types</span>
        <div className="flex flex-wrap gap-2">
          {ROLE_OPTIONS.map((r) => (
            <TogglePill
              key={r}
              label={r}
              active={data.roles.includes(r)}
              onClick={() => toggleRole(r)}
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <span className={sectionLabelClassName}>Work Style</span>
        <div className="flex gap-2">
          {WORK_STYLES.map((ws) => (
            <Button
              key={ws}
              variant="ghost"
              onClick={() => onChange({ workStyle: ws as WorkStyle })}
              className={`h-auto flex-1 rounded-lg border p-2.5 text-sm transition-all hover:bg-transparent ${
                data.workStyle === ws
                  ? 'border-primary bg-primary-light font-bold text-primary'
                  : 'border-border font-medium text-muted-foreground'
              }`}
            >
              {ws}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <span className={sectionLabelClassName}>Target Salary Range</span>
        <div className="flex items-center gap-3">
          <span className="w-[54px] text-sm font-extrabold text-primary">
            ${data.salaryMin}K
          </span>
          <Slider
            min={60}
            max={300}
            step={10}
            value={[data.salaryMin]}
            onValueChange={(values) => onChange({ salaryMin: values[0] ?? data.salaryMin })}
            className="flex-1"
          />
          <Slider
            min={60}
            max={300}
            step={10}
            value={[data.salaryMax]}
            onValueChange={(values) => onChange({ salaryMax: values[0] ?? data.salaryMax })}
            className="flex-1"
          />
          <span className="w-[54px] text-right text-sm font-extrabold text-primary">
            ${data.salaryMax}K
          </span>
        </div>
      </div>

      <div>
        <span className={sectionLabelClassName}>Company Size</span>
        <div className="flex flex-wrap gap-2">
          {COMPANY_SIZES.map((s) => (
            <TogglePill
              key={s}
              label={s}
              active={data.companySizes.includes(s)}
              onClick={() => toggleCompanySize(s)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
