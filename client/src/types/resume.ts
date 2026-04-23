export interface ResumeSection {
  id: string
  sectionType: string
  content: string
}

export interface ResumeDocument {
  id: string
  userId: string
  label: string | null
  mimeType: string
  sizeBytes: number
  primary: boolean
  parsedAt: string | null
  createdDate: string
  sections: ResumeSection[]
}
