export type PageStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export interface PageAuthor {
  id: string;
  name: string;
  email: string;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  status: PageStatus;
  authorId?: string | null;
  author?: PageAuthor | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageListMeta {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface PageListResponse {
  data: CmsPage[];
  meta: PageListMeta;
}

export interface PageListQuery {
  limit?: number;
  page?: number;
  search?: string;
  status?: PageStatus | '';
}

export interface PageFormInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
}
