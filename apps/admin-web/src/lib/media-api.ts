import { apiClient } from '@/lib/api-client';
import type {
  MediaAsset,
  MediaListQuery,
  MediaListResponse,
  MediaUpdateInput,
  MediaUploadInput,
} from '@/types/media';

function toQueryString(query: MediaListQuery) {
  const params = new URLSearchParams();

  params.set('page', String(query.page ?? 1));
  params.set('limit', String(query.limit ?? 20));

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  if (query.mimeType) {
    params.set('mimeType', query.mimeType);
  }

  if (query.folder?.trim()) {
    params.set('folder', query.folder.trim());
  }

  return params.toString();
}

function cleanPayload(input: MediaUpdateInput) {
  return {
    altText: input.altText?.trim() || null,
    caption: input.caption?.trim() || null,
    folder: input.folder?.trim() || null,
  };
}

export function listMedia(query: MediaListQuery) {
  return apiClient<MediaListResponse>(`/api/media?${toQueryString(query)}`);
}

export function getMedia(id: string) {
  return apiClient<MediaAsset>(`/api/media/${id}`);
}

export function uploadMedia(input: MediaUploadInput) {
  const formData = new FormData();

  formData.set('file', input.file);
  formData.set('altText', input.altText?.trim() ?? '');
  formData.set('caption', input.caption?.trim() ?? '');
  formData.set('folder', input.folder?.trim() ?? '');

  return apiClient<MediaAsset>('/api/media/upload', {
    body: formData,
    method: 'POST',
  });
}

export function updateMedia(id: string, input: MediaUpdateInput) {
  return apiClient<MediaAsset>(`/api/media/${id}`, {
    body: JSON.stringify(cleanPayload(input)),
    method: 'PUT',
  });
}

export function deleteMedia(id: string) {
  return apiClient<MediaAsset>(`/api/media/${id}`, {
    method: 'DELETE',
  });
}
