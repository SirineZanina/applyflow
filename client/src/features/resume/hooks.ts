import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listResumes,
  uploadResume,
  setPrimary,
  reparseResume,
  deleteResume,
  updateResumeLabel,
  replaceResumeFile,
} from './api'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api/error-message'

export const resumeKeys = {
  all: () => ['resumes'] as const,
}

export function useResumes() {
  return useQuery({
    queryKey: resumeKeys.all(),
    queryFn: listResumes,
    refetchInterval: (query) =>
      query.state.data?.some(
        (resume) =>
          resume.parseStatus === 'PROCESSING' || resume.parseStatus === 'PENDING',
      )
        ? 2000
        : false,
  })
}

export function useUploadResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, label }: { file: File; label?: string }) =>
      uploadResume(file, label),
    onSuccess: () => {
      toast.success('Resume uploaded')
      queryClient.invalidateQueries({ queryKey: resumeKeys.all() })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Upload failed. Please try again.'))
    },
  })
}

export function useSetPrimary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => setPrimary(id),
    onSuccess: () => {
      toast.success('Primary resume updated')
      queryClient.invalidateQueries({ queryKey: resumeKeys.all() })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to set primary resume.'))
    },
  })
}

export function useReparseResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reparseResume(id),
    onSuccess: () => {
      toast.success('Reparse started')
      queryClient.invalidateQueries({ queryKey: resumeKeys.all() })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to start reparse.'))
    },
  })
}

export function useDeleteResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteResume(id),
    onSuccess: () => {
      toast.success('Resume deleted')
      queryClient.invalidateQueries({ queryKey: resumeKeys.all() })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to delete resume.'))
    },
  })
}

export function useUpdateResumeLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, label }: { id: string; label: string | null }) =>
      updateResumeLabel(id, label),
    onSuccess: () => {
      toast.success('Resume label updated')
      queryClient.invalidateQueries({ queryKey: resumeKeys.all() })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update resume label.'))
    },
  })
}

export function useReplaceResumeFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file, label }: { id: string; file: File; label?: string }) =>
      replaceResumeFile(id, file, label),
    onSuccess: () => {
      toast.success('Resume file replaced')
      queryClient.invalidateQueries({ queryKey: resumeKeys.all() })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to replace resume file.'))
    },
  })
}
