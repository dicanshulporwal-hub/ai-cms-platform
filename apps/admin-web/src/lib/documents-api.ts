import { apiClient } from '@/lib/api-client';

export interface Document {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  summary: string | null;
  originalFileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  pageCount: number | null;
  documentType: string;
  status: string;
  category: { id: string; name: string; slug: string } | null;
  seoTitle: string | null;
  seoDescription: string | null;
  aiMetadataJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface DocumentCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { documents: number };
}

export async function fetchDocuments(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiClient<{ data: Document[]; total: number }>(`/api/documents${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
}

export async function fetchDocument(id: string) {
  return apiClient<Document>(`/api/documents/${id}`, { cache: 'no-store' });
}

export async function uploadDocument(formData: FormData) {
  return apiClient<Document>('/api/documents/upload', { body: formData, method: 'POST' });
}

export async function updateDocument(id: string, data: Record<string, unknown>) {
  return apiClient<Document>(`/api/documents/${id}`, { body: JSON.stringify(data), method: 'PUT' });
}

export async function deleteDocument(id: string) {
  return apiClient<{ message: string }>(`/api/documents/${id}`, { method: 'DELETE' });
}

export async function publishDocument(id: string) {
  return apiClient<Document>(`/api/documents/${id}/publish`, { method: 'POST' });
}

export async function archiveDocument(id: string) {
  return apiClient<Document>(`/api/documents/${id}/archive`, { method: 'POST' });
}

export async function generateDocumentMetadata(id: string) {
  return apiClient<any>(`/api/documents/${id}/generate-metadata`, { method: 'POST' });
}

export async function applyAIMetadata(id: string, jobId: string) {
  return apiClient<Document>(`/api/documents/${id}/apply-ai-metadata`, { body: JSON.stringify({ jobId }), method: 'POST' });
}

export async function fetchDocumentCategories() {
  return apiClient<DocumentCategory[]>('/api/document-categories', { cache: 'no-store' });
}

export async function createDocumentCategory(data: { name: string; slug: string; description?: string }) {
  return apiClient<DocumentCategory>('/api/document-categories', { body: JSON.stringify(data), method: 'POST' });
}
