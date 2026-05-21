import type { AuthUser } from '@/types/auth';
import type { BlogStatus, CmsBlog } from '@/types/blog';

export function canCreateBlog(user: AuthUser) {
  return user.role === 'Super Admin' || user.role === 'Editor';
}

export function canEditBlog(user: AuthUser, blog?: Pick<CmsBlog, 'status'>) {
  if (user.role === 'Super Admin') {
    return true;
  }

  return user.role === 'Editor' && (!blog || blog.status === 'DRAFT');
}

export function canSubmitBlog(user: AuthUser, blog?: Pick<CmsBlog, 'status'>) {
  if (user.role === 'Super Admin' && (!blog || blog.status === 'DRAFT')) {
    return true;
  }

  return user.role === 'Editor' && (!blog || blog.status === 'DRAFT');
}

export function canApproveBlog(user: AuthUser, blog: Pick<CmsBlog, 'status'>) {
  if (
    user.role === 'Super Admin' &&
    (blog.status === 'SUBMITTED' || blog.status === 'UNDER_REVIEW')
  ) {
    return true;
  }

  return (
    user.role === 'Reviewer' &&
    (blog.status === 'SUBMITTED' || blog.status === 'UNDER_REVIEW')
  );
}

export function canPublishBlog(user: AuthUser, blog: Pick<CmsBlog, 'status'>) {
  if (user.role === 'Super Admin' && blog.status === 'APPROVED') {
    return true;
  }

  return user.role === 'Publisher' && blog.status === 'APPROVED';
}

export function canDeleteBlog(user: AuthUser) {
  return user.role === 'Super Admin';
}

export function canManageTaxonomy(user: AuthUser) {
  return ['Super Admin', 'Admin', 'Editor'].includes(user.role);
}

export function canDeleteTaxonomy(user: AuthUser) {
  return ['Super Admin', 'Admin'].includes(user.role);
}

export const blogStatuses: BlogStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED',
];
