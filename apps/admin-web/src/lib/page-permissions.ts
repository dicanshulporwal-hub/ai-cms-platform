import type { AuthUser } from '@/types/auth';
import type { CmsPage, PageStatus } from '@/types/page';

export function canCreatePage(user: AuthUser) {
  return user.role === 'Super Admin' || user.role === 'Editor';
}

export function canEditPage(user: AuthUser, page?: Pick<CmsPage, 'status'>) {
  if (user.role === 'Super Admin') {
    return true;
  }

  return (
    user.role === 'Editor' &&
    (!page || page.status === 'DRAFT' || page.status === 'CHANGES_REQUESTED')
  );
}

export function canSubmitPage(user: AuthUser, page?: Pick<CmsPage, 'status'>) {
  const canSubmitStatus =
    !page || page.status === 'DRAFT' || page.status === 'CHANGES_REQUESTED';

  if (user.role === 'Super Admin' && canSubmitStatus) {
    return true;
  }

  return user.role === 'Editor' && canSubmitStatus;
}

export function canApprovePage(user: AuthUser, page: Pick<CmsPage, 'status'>) {
  if (
    user.role === 'Super Admin' &&
    (page.status === 'SUBMITTED' || page.status === 'UNDER_REVIEW')
  ) {
    return true;
  }

  return (
    user.role === 'Reviewer' &&
    (page.status === 'SUBMITTED' || page.status === 'UNDER_REVIEW')
  );
}

export function canPublishPage(user: AuthUser, page: Pick<CmsPage, 'status'>) {
  if (user.role === 'Super Admin' && page.status === 'APPROVED') {
    return true;
  }

  return user.role === 'Publisher' && page.status === 'APPROVED';
}

export function canDeletePage(user: AuthUser) {
  return user.role === 'Super Admin';
}

export const pageStatuses: PageStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'CHANGES_REQUESTED',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED',
];
