import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
      <div className="mb-3.5 flex min-h-9 flex-wrap gap-2">
        {data.skills.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-md bg-primary-light px-2.5 py-1 text-sm font-semibold text-primary"
          >
            {s}
            <Button
              variant="ghost"
              aria-label={`Remove ${s}`}
              onClick={() => removeSkill(s)}
              className="h-auto p-0 text-base leading-none text-primary hover:bg-transparent"
            >
              ×
            </Button>
          </span>
        ))}
        {data.skills.length === 0 && (
          <span className="text-[13px] text-muted-foreground">No skills added yet</span>
        )}
      </div>

      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(input) } }}
        placeholder="Type a skill and press Enter…"
        className="mb-3.5 h-10"
      />

      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
        Suggestions
      </p>
      <div className="flex flex-wrap gap-2">
        {SKILL_SUGGESTIONS.filter((s) => !data.skills.includes(s)).map((s) => (
          <Button
            key={s}
            variant="outline"
            onClick={() => addSkill(s)}
            className="h-auto rounded-md px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary"
          >
            + {s}
          </Button>
        ))}
      </div>
    </div>
  )
}
