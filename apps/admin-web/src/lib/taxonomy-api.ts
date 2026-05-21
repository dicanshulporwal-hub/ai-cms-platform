import { apiClient } from '@/lib/api-client';
import type {
  Category,
  CategoryFormInput,
  Tag,
  TagFormInput,
} from '@/types/taxonomy';

export function listCategories() {
  return apiClient<Category[]>('/api/categories');
}

export function createCategory(input: CategoryFormInput) {
  return apiClient<Category>('/api/categories', {
    body: JSON.stringify({
      description: input.description?.trim() || undefined,
      name: input.name.trim(),
      slug: input.slug.trim(),
    }),
    method: 'POST',
  });
}

export function updateCategory(id: string, input: CategoryFormInput) {
  return apiClient<Category>(`/api/categories/${id}`, {
    body: JSON.stringify({
      description: input.description?.trim() || undefined,
      name: input.name.trim(),
      slug: input.slug.trim(),
    }),
    method: 'PUT',
  });
}

export function deleteCategory(id: string) {
  return apiClient<Category>(`/api/categories/${id}`, {
    method: 'DELETE',
  });
}

export function listTags() {
  return apiClient<Tag[]>('/api/tags');
}

export function createTag(input: TagFormInput) {
  return apiClient<Tag>('/api/tags', {
    body: JSON.stringify({
      name: input.name.trim(),
      slug: input.slug.trim(),
    }),
    method: 'POST',
  });
}

export function updateTag(id: string, input: TagFormInput) {
  return apiClient<Tag>(`/api/tags/${id}`, {
    body: JSON.stringify({
      name: input.name.trim(),
      slug: input.slug.trim(),
    }),
    method: 'PUT',
  });
}

export function deleteTag(id: string) {
  return apiClient<Tag>(`/api/tags/${id}`, {
    method: 'DELETE',
  });
}
