import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listResumes, uploadResume, setPrimary, reparseResume, deleteResume } from './api'

export const resumeKeys = {
  all: () => ['resumes'] as const,
}

export function useResumes() {
  return useQuery({
    queryKey: resumeKeys.all(),
    queryFn: listResumes,
  })
}

export function useUploadResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, label }: { file: File; label?: string }) =>
      uploadResume(file, label),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resumeKeys.all() }),
  })
}

export function useSetPrimary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => setPrimary(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resumeKeys.all() }),
  })
}

export function useReparseResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reparseResume(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resumeKeys.all() }),
  })
}

export function useDeleteResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteResume(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resumeKeys.all() }),
  })
}
