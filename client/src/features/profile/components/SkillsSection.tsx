import { useState } from 'react'
import { Controller, type Control } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProfileInput } from '../schema'
import { ProfileSection } from './ProfileSection'

interface TagFieldProps {
  label: string
  placeholder: string
  values: string[]
  onChange: (values: string[]) => void
}

function TagField({ label, placeholder, values, onChange }: Readonly<TagFieldProps>) {
  const [inputValue, setInputValue] = useState('')

  function addValue() {
    const trimmed = inputValue.trim()
    if (!trimmed || values.includes(trimmed)) return
    onChange([...values, trimmed])
    setInputValue('')
  }

  return (
    <div className="space-y-2.5">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {values.length > 0 ? (
          values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 rounded-md bg-primary-light px-2 py-1 text-xs font-semibold text-primary"
            >
              {value}
              <Button
                type="button"
                variant="ghost"
                aria-label={`Remove ${value}`}
                onClick={() => onChange(values.filter((item) => item !== value))}
                className="h-auto p-0 text-sm leading-none hover:bg-transparent"
              >
                ×
              </Button>
            </span>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">No entries yet</span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addValue()
            }
          }}
          placeholder={placeholder}
          className="h-8"
        />
        <Button type="button" className="h-8 text-xs font-bold" onClick={addValue}>
          Add
        </Button>
      </div>
    </div>
  )
}

interface Props {
  control: Control<ProfileInput>
}

export function SkillsSection({ control }: Readonly<Props>) {
  return (
    <ProfileSection title="Skills">
      <div className="space-y-4">
        <Controller
          name="skills"
          control={control}
          render={({ field }) => (
            <TagField
              label="Core Skills"
              placeholder="Add a skill..."
              values={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="desiredRoles"
          control={control}
          render={({ field }) => (
            <TagField
              label="Target Roles"
              placeholder="Add a target role..."
              values={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </ProfileSection>
  )
}
