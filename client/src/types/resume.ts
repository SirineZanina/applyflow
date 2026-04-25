export type ResumeParseStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'

export interface ResumeSection {
  id: string
  type: string
  rawJson: unknown
  orderIndex: number
}

export interface ResumeDocument {
  id: string
  userId: string
  label: string | null
  mimeType: string
  sizeBytes: number
  primary: boolean
  parseStatus: ResumeParseStatus
  parseError: string | null
  parsedAt: string | null
  createdDate: string
  lastModifiedDate: string
  sections: ResumeSection[]
}
