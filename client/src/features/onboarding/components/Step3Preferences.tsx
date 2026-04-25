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
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs transition-all ${
        active
          ? 'border-primary bg-primary-light font-bold text-primary'
          : 'border-border bg-transparent font-medium text-muted-foreground'
      }`}
    >
      {label}
    </button>
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
      {/* Role Types */}
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

      {/* Work Style */}
      <div className="mb-4">
        <span className={sectionLabelClassName}>Work Style</span>
        <div className="flex gap-2">
          {WORK_STYLES.map((ws) => (
            <button
              key={ws}
              type="button"
              onClick={() => onChange({ workStyle: ws as WorkStyle })}
              className={`flex-1 cursor-pointer rounded-lg border p-2.5 text-sm transition-all ${
                data.workStyle === ws
                  ? 'border-primary bg-primary-light font-bold text-primary'
                  : 'border-border bg-transparent font-medium text-muted-foreground'
              }`}
            >
              {ws}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="mb-4">
        <span className={sectionLabelClassName}>Target Salary Range</span>
        <div className="flex items-center gap-3">
          <span className="w-[54px] text-sm font-extrabold text-primary">
            ${data.salaryMin}K
          </span>
          <input
            type="range"
            min={60}
            max={300}
            step={10}
            value={data.salaryMin}
            onChange={(e) => onChange({ salaryMin: Number(e.target.value) })}
            className="flex-1 accent-primary"
          />
          <input
            type="range"
            min={60}
            max={300}
            step={10}
            value={data.salaryMax}
            onChange={(e) => onChange({ salaryMax: Number(e.target.value) })}
            className="flex-1 accent-primary"
          />
          <span className="w-[54px] text-right text-sm font-extrabold text-primary">
            ${data.salaryMax}K
          </span>
        </div>
      </div>

      {/* Company Size */}
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
