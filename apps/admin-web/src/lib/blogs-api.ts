import { apiClient } from '@/lib/api-client';
import type {
  BlogFormInput,
  BlogListQuery,
  BlogListResponse,
  CmsBlog,
} from '@/types/blog';

function cleanPayload(input: BlogFormInput) {
  return {
    categoryId: input.categoryId || null,
    content: input.content,
    excerpt: input.excerpt?.trim() || undefined,
    featuredImage: input.featuredImage?.trim() || undefined,
    metaDescription: input.metaDescription?.trim() || undefined,
    metaTitle: input.metaTitle?.trim() || undefined,
    slug: input.slug.trim(),
    tagIds: input.tagIds,
    title: input.title.trim(),
  };
}

function toQueryString(query: BlogListQuery) {
  const params = new URLSearchParams();

  params.set('page', String(query.page ?? 1));
  params.set('limit', String(query.limit ?? 10));

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  if (query.status) {
    params.set('status', query.status);
  }

  if (query.categoryId) {
    params.set('categoryId', query.categoryId);
  }

  if (query.tagId) {
    params.set('tagId', query.tagId);
  }

  return params.toString();
}

export function listBlogs(query: BlogListQuery) {
  return apiClient<BlogListResponse>(`/api/blogs?${toQueryString(query)}`);
}

export function getBlog(id: string) {
  return apiClient<CmsBlog>(`/api/blogs/${id}`);
}

export function createBlog(input: BlogFormInput) {
  return apiClient<CmsBlog>('/api/blogs', {
    body: JSON.stringify(cleanPayload(input)),
    method: 'POST',
  });
}

export function updateBlog(id: string, input: BlogFormInput) {
  return apiClient<CmsBlog>(`/api/blogs/${id}`, {
    body: JSON.stringify(cleanPayload(input)),
    method: 'PUT',
  });
}

export function deleteBlog(id: string) {
  return apiClient<CmsBlog>(`/api/blogs/${id}`, {
    method: 'DELETE',
  });
}

export function submitBlog(id: string) {
  return apiClient<CmsBlog>(`/api/blogs/${id}/submit`, {
    method: 'POST',
  });
}

export function approveBlog(id: string) {
  return apiClient<CmsBlog>(`/api/blogs/${id}/approve`, {
    method: 'POST',
  });
}

export function publishBlog(id: string) {
  return apiClient<CmsBlog>(`/api/blogs/${id}/publish`, {
    method: 'POST',
  });
}
