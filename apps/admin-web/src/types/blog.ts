import type { AuthUser } from '@/types/auth';
import type { Category, Tag } from '@/types/taxonomy';

export type BlogStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export interface CmsBlog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  categoryId?: string | null;
  category?: Pick<Category, 'id' | 'name' | 'slug'> | null;
  tags: Pick<Tag, 'id' | 'name' | 'slug'>[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  status: BlogStatus;
  authorId?: string | null;
  author?: Pick<AuthUser, 'id' | 'name' | 'email'> | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListMeta {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface BlogListResponse {
  data: CmsBlog[];
  meta: BlogListMeta;
}

export interface BlogListQuery {
  categoryId?: string;
  limit?: number;
  page?: number;
  search?: string;
  status?: BlogStatus | '';
  tagId?: string;
}

export interface BlogFormInput {
  categoryId?: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  metaDescription?: string;
  metaTitle?: string;
  slug: string;
  tagIds: string[];
  title: string;
}
