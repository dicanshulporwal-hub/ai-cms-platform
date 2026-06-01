import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateTemplate,
  aiGenerateTemplate,
  deactivateTemplate,
  deleteTemplate,
  fetchTemplate,
  fetchTemplates,
  getComplianceReport,
  runComplianceCheck,
  saveAIJobAsTemplate,
  seedDummyTemplates,
  selectTemplate,
  uploadTemplate,
} from '@/lib/templates-api';

export const templatesQueryKey = ['templates'] as const;

export function useTemplates() {
  return useQuery({ queryFn: fetchTemplates, queryKey: templatesQueryKey });
}

export function useTemplate(id: string) {
  return useQuery({ enabled: !!id, queryFn: () => fetchTemplate(id), queryKey: [...templatesQueryKey, id] });
}

export function useUploadTemplate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: uploadTemplate, onSuccess: () => qc.invalidateQueries({ queryKey: templatesQueryKey }) });
}

export function useActivateTemplate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: activateTemplate, onSuccess: () => qc.invalidateQueries({ queryKey: templatesQueryKey }) });
}

export function useDeactivateTemplate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deactivateTemplate, onSuccess: () => qc.invalidateQueries({ queryKey: templatesQueryKey }) });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteTemplate, onSuccess: () => qc.invalidateQueries({ queryKey: templatesQueryKey }) });
}

export function useRunComplianceCheck() {
  return useMutation({ mutationFn: runComplianceCheck });
}

export function useComplianceReport(id: string) {
  return useQuery({ enabled: !!id, queryFn: () => getComplianceReport(id), queryKey: ['compliance', id] });
}

export function useAIGenerateTemplate() {
  return useMutation({ mutationFn: aiGenerateTemplate });
}

export function useSaveAIJobAsTemplate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: saveAIJobAsTemplate, onSuccess: () => qc.invalidateQueries({ queryKey: templatesQueryKey }) });
}

export function useSeedDummyTemplates() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: seedDummyTemplates, onSuccess: () => qc.invalidateQueries({ queryKey: templatesQueryKey }) });
}

export function useSelectTemplate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: selectTemplate, onSuccess: () => qc.invalidateQueries({ queryKey: templatesQueryKey }) });
}
