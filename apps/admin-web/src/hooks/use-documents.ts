import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  applyAIMetadata, archiveDocument, deleteDocument, fetchDocument,
  fetchDocumentCategories, fetchDocuments, generateDocumentMetadata,
  publishDocument, uploadDocument,
} from '@/lib/documents-api';

export function useDocuments(params: Record<string, string> = {}) {
  return useQuery({ queryFn: () => fetchDocuments(params), queryKey: ['documents', params] });
}

export function useDocument(id: string) {
  return useQuery({ enabled: !!id, queryFn: () => fetchDocument(id), queryKey: ['documents', id] });
}

export function useDocumentCategories() {
  return useQuery({ queryFn: fetchDocumentCategories, queryKey: ['document-categories'] });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: uploadDocument, onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }) });
}

export function usePublishDocument() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: publishDocument, onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }) });
}

export function useArchiveDocument() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: archiveDocument, onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }) });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteDocument, onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }) });
}

export function useGenerateMetadata() {
  return useMutation({ mutationFn: generateDocumentMetadata });
}

export function useApplyAIMetadata() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, jobId }: { id: string; jobId: string }) => applyAIMetadata(id, jobId), onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }) });
}
