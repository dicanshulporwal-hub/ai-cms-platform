export interface MediaUploader {
  id: string;
  name: string;
  email: string;
}

export interface MediaAsset {
  id: string;
  originalName: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  altText?: string | null;
  caption?: string | null;
  folder?: string | null;
  uploadedById?: string | null;
  uploadedBy?: MediaUploader | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaListMeta {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface MediaListResponse {
  data: MediaAsset[];
  meta: MediaListMeta;
}

export interface MediaListQuery {
  folder?: string;
  limit?: number;
  mimeType?: string;
  page?: number;
  search?: string;
}

export interface MediaUpdateInput {
  altText?: string;
  caption?: string;
  folder?: string;
}

export interface MediaUploadInput extends MediaUpdateInput {
  file: File;
}
