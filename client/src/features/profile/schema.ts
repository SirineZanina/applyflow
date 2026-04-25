import { z } from 'zod'

const REMOTE_PREFERENCES = ['REMOTE', 'HYBRID', 'ON_SITE', 'FLEXIBLE'] as const

const nullableString = (schema: z.ZodString) =>
  schema.nullable().transform(v => v === '' ? null : v)

const nullableInt = (schema: z.ZodNumber) =>
  z.union([
    z.null(),
    z.literal('').transform((): null => null),
    schema,
    z.string().transform(Number).pipe(schema),
  ])

const normalizedStringList = z.array(z.string()).transform((values) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))),
)

export const profileSchema = z.object({
  headline: nullableString(z.string().max(255, 'Headline must be 255 characters or fewer')),
  summary: nullableString(z.string()),
  yearsExperience: nullableInt(
    z.number()
      .int('Years of experience must be a whole number')
      .min(0, 'Years of experience cannot be negative')
      .max(50, 'Years of experience cannot exceed 50')
  ),
  desiredRoles: normalizedStringList,
  desiredLocations: normalizedStringList,
  skills: normalizedStringList,
  companySizes: normalizedStringList,
  remotePreference: z.union([
    z.null(),
    z.literal('').transform((): null => null),
    z.enum(REMOTE_PREFERENCES),
  ]),
  salaryMin: nullableInt(
    z.number()
      .int('Salary must be a whole number')
      .min(0, 'Salary cannot be negative')
  ),
  salaryMax: nullableInt(
    z.number()
      .int('Salary must be a whole number')
      .min(0, 'Salary cannot be negative')
  ),
  currency: nullableString(
    z.string()
      .length(3, 'Currency must be a 3-letter code (e.g. EUR, USD)')
  ),
})
.refine(
  d => d.salaryMin === null || d.salaryMax === null || d.salaryMin <= d.salaryMax,
  { message: 'Minimum salary cannot exceed maximum salary', path: ['salaryMin'] }
)

export type ProfileInput = z.infer<typeof profileSchema>
