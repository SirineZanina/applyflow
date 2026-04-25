export type ExperienceOption =
  | '< 1 year'
  | '1–2 years'
  | '3–5 years'
  | '5–10 years'
  | '10+ years'

export type WorkStyle = 'Remote' | 'Hybrid' | 'On-site'

export interface WizardData {
  // Step 1 — Basics
  headline: string      // "Current or Most Recent Title"
  location: string      // single location string
  experience: ExperienceOption

  // Step 2 — Skills
  skills: string[]      // tech skills (React, TypeScript…)

  // Step 3 — Preferences
  roles: string[]       // desired job roles → maps to desiredRoles
  workStyle: WorkStyle
  salaryMin: number     // K value (e.g. 120 = $120K)
  salaryMax: number     // K value
  companySizes: string[]
}

export const EMPTY_WIZARD_DATA: WizardData = {
  headline: '',
  location: '',
  experience: '3–5 years',
  skills: [],
  roles: [],
  workStyle: 'Hybrid',
  salaryMin: 120,
  salaryMax: 200,
  companySizes: [],
}

export const TOTAL_STEPS = 5

export const STEP_LABELS = ['Basics', 'Skills', 'Preferences', 'Resume', 'Done'] as const

export const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  '< 1 year',
  '1–2 years',
  '3–5 years',
  '5–10 years',
  '10+ years',
]

export const WORK_STYLES: WorkStyle[] = ['Remote', 'Hybrid', 'On-site']

export const COMPANY_SIZES = [
  'Startup (1–50)',
  'Scale-up (50–500)',
  'Mid-size (500–5K)',
  'Enterprise (5K+)',
]

export const ROLE_OPTIONS = [
  'Frontend Engineer',
  'Full Stack Engineer',
  'Backend Engineer',
  'Staff / Lead Engineer',
  'Product Designer',
  'Product Manager',
  'Data Engineer',
  'DevOps / Platform',
]

// Maps ExperienceOption → yearsExperience integer for the server
export const EXPERIENCE_TO_YEARS: Record<ExperienceOption, number> = {
  '< 1 year':   0,
  '1–2 years':  1,
  '3–5 years':  4,
  '5–10 years': 7,
  '10+ years':  10,
}

// Maps WorkStyle → server RemotePreference enum value
export const WORK_STYLE_TO_REMOTE: Record<WorkStyle, 'REMOTE' | 'HYBRID' | 'ON_SITE'> = {
  'Remote':   'REMOTE',
  'Hybrid':   'HYBRID',
  'On-site':  'ON_SITE',
}
