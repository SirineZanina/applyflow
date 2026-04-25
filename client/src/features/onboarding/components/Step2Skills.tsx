import { useState } from 'react'
import type { WizardData } from '../types'

const SKILL_SUGGESTIONS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'AWS',
  'Figma', 'Next.js', 'GraphQL', 'PostgreSQL', 'Docker',
  'Go', 'Vue', 'Swift', 'SQL',
]

interface Props {
  data: WizardData
  onChange: (patch: Partial<WizardData>) => void
}

export function Step2Skills({ data, onChange }: Props) {
  const [input, setInput] = useState('')

  function addSkill(skill: string) {
    const trimmed = skill.trim()
    if (!trimmed || data.skills.includes(trimmed)) return
    onChange({ skills: [...data.skills, trimmed] })
    setInput('')
  }

  function removeSkill(skill: string) {
    onChange({ skills: data.skills.filter((s) => s !== skill) })
  }

  return (
    <div>
      {/* Tags */}
      <div className="mb-3.5 flex min-h-9 flex-wrap gap-2">
        {data.skills.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-md bg-primary-light px-2.5 py-1 text-sm font-semibold text-primary"
          >
            {s}
            <button
              type="button"
              aria-label={`Remove ${s}`}
              onClick={() => removeSkill(s)}
              className="cursor-pointer border-0 bg-transparent p-0 text-base leading-none text-primary"
            >
              ×
            </button>
          </span>
        ))}
        {data.skills.length === 0 && (
          <span className="text-[13px] text-muted-foreground">No skills added yet</span>
        )}
      </div>

      {/* Text input */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(input) } }}
        placeholder="Type a skill and press Enter…"
        className="mb-3.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-[13.5px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
      />

      {/* Suggestions */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
        Suggestions
      </p>
      <div className="flex flex-wrap gap-2">
        {SKILL_SUGGESTIONS.filter((s) => !data.skills.includes(s)).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => addSkill(s)}
            className="cursor-pointer rounded-md border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary"
          >
            + {s}
          </button>
        ))}
      </div>
    </div>
  )
}
