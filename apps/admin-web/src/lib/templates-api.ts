import { apiClient } from '@/lib/api-client';

export interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  version: string;
  templateType: string;
  status: string;
  isActive: boolean;
  thumbnailUrl: string | null;
  configJson: Record<string, unknown> | null;
  complianceJson: Record<string, unknown> | null;
  fileUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceReport {
  overallStatus: string;
  score: number;
  criticalFailures: number;
  warnings: number;
  checks: Array<{
    checkKey: string;
    checkTitle: string;
    checkCategory: string;
    status: string;
    severity: string;
    message: string;
    recommendation: string;
  }>;
  disclaimer: string;
}

export interface AIGenerationJob {
  id: string;
  status: string;
  prompt: string | null;
  templateType: string;
  generatedHtml: string | null;
  generatedCss: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export async function fetchTemplates() {
  return apiClient<Template[]>('/api/templates', { cache: 'no-store' });
}

export async function fetchTemplate(id: string) {
  return apiClient<Template>(`/api/templates/${id}`, { cache: 'no-store' });
}

export async function uploadTemplate(formData: FormData) {
  return apiClient<Template>('/api/templates/upload', {
    body: formData,
    method: 'POST',
  });
}

export async function updateTemplate(id: string, data: { name?: string; description?: string; templateType?: string }) {
  return apiClient<Template>(`/api/templates/${id}`, { body: JSON.stringify(data), method: 'PUT' });
}

export async function deleteTemplate(id: string) {
  return apiClient<{ message: string }>(`/api/templates/${id}`, { method: 'DELETE' });
}

export async function activateTemplate(id: string) {
  return apiClient<Template>(`/api/templates/${id}/activate`, { method: 'POST' });
}

export async function deactivateTemplate(id: string) {
  return apiClient<Template>(`/api/templates/${id}/deactivate`, { method: 'POST' });
}

export async function runComplianceCheck(id: string) {
  return apiClient<ComplianceReport>(`/api/templates/${id}/run-compliance-check`, { method: 'POST' });
}

export async function getComplianceReport(id: string) {
  return apiClient<ComplianceReport>(`/api/templates/${id}/compliance-report`, { cache: 'no-store' });
}

export async function aiGenerateTemplate(data: { prompt?: string; templateType?: string }) {
  return apiClient<AIGenerationJob>('/api/templates/ai/generate-from-screenshot', { body: JSON.stringify(data), method: 'POST' });
}

export async function getAIGenerationJob(id: string) {
  return apiClient<AIGenerationJob>(`/api/templates/ai/generation-jobs/${id}`, { cache: 'no-store' });
}

export async function saveAIJobAsTemplate(jobId: string) {
  return apiClient<Template>(`/api/templates/ai/generation-jobs/${jobId}/save-as-template`, { method: 'POST' });
}

export async function seedDummyTemplates() {
  return apiClient<{ message: string; templates: Template[] }>('/api/templates/seed', { method: 'POST' });
}

export async function getTemplatePreviewHtml(id: string) {
  return apiClient<string>(`/api/templates/${id}/preview-html`, { cache: 'no-store' });
}

export async function selectTemplate(id: string) {
  return apiClient<Template>(`/api/templates/${id}/select`, { method: 'POST' });
}
