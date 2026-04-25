import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteDocument, duplicateDocument, getDocument, listDocuments, updateDocument, uploadDocument } from "./api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/error-message";

export const documentKeys = {
  all: () => ["documents"] as const,
  detail: (id: string) => ["documents", "detail", id] as const,
};

export function useDocuments() {
  return useQuery({
    queryKey: documentKeys.all(),
    queryFn: listDocuments,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => getDocument(id),
    enabled: Boolean(id),
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, title }: { file: File; title?: string }) => uploadDocument(file, title),
    onSuccess: () => {
      toast.success("Document uploaded");
      queryClient.invalidateQueries({ queryKey: documentKeys.all() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to upload document."));
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; content?: string | null } }) =>
      updateDocument(id, data),
    onSuccess: (document) => {
      queryClient.setQueryData(documentKeys.detail(document.id), document);
      queryClient.invalidateQueries({ queryKey: documentKeys.all() });
      toast.success("Document saved");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save document."));
    },
  });
}

export function useDuplicateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateDocument(id),
    onSuccess: () => {
      toast.success("Document duplicated");
      queryClient.invalidateQueries({ queryKey: documentKeys.all() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to duplicate document."));
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: documentKeys.all() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete document."));
    },
  });
}
