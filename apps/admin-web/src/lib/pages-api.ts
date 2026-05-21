import { apiClient } from '@/lib/api-client';
import type {
  CmsPage,
  PageFormInput,
  PageListQuery,
  PageListResponse,
} from '@/types/page';

function cleanPayload(input: PageFormInput) {
  return {
    content: input.content,
    excerpt: input.excerpt?.trim() || undefined,
    featuredImage: input.featuredImage?.trim() || undefined,
    metaDescription: input.metaDescription?.trim() || undefined,
    metaTitle: input.metaTitle?.trim() || undefined,
    slug: input.slug.trim(),
    title: input.title.trim(),
  };
}

function toQueryString(query: PageListQuery) {
  const params = new URLSearchParams();

  params.set('page', String(query.page ?? 1));
  params.set('limit', String(query.limit ?? 10));

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  if (query.status) {
    params.set('status', query.status);
  }

  return params.toString();
}

export function listPages(query: PageListQuery) {
  return apiClient<PageListResponse>(`/api/pages?${toQueryString(query)}`);
}

export function getPage(id: string) {
  return apiClient<CmsPage>(`/api/pages/${id}`);
}

export function createPage(input: PageFormInput) {
  return apiClient<CmsPage>('/api/pages', {
    body: JSON.stringify(cleanPayload(input)),
    method: 'POST',
  });
}

export function updatePage(id: string, input: PageFormInput) {
  return apiClient<CmsPage>(`/api/pages/${id}`, {
    body: JSON.stringify(cleanPayload(input)),
    method: 'PUT',
  });
}

export function deletePage(id: string) {
  return apiClient<CmsPage>(`/api/pages/${id}`, {
    method: 'DELETE',
  });
}

export function submitPage(id: string) {
  return apiClient<CmsPage>(`/api/pages/${id}/submit`, {
    method: 'POST',
  });
}

export function approvePage(id: string) {
  return apiClient<CmsPage>(`/api/pages/${id}/approve`, {
    method: 'POST',
  });
}

export function publishPage(id: string) {
  return apiClient<CmsPage>(`/api/pages/${id}/publish`, {
    method: 'POST',
  });
}
