import type { AuthUser } from '@/types/auth';
import type { WorkflowContentItem } from '@/types/workflow';

export function canWorkflowSubmit(user: AuthUser, item: WorkflowContentItem) {
  return (
    ['Editor', 'Super Admin'].includes(user.role) &&
    (item.status === 'DRAFT' || item.status === 'CHANGES_REQUESTED')
  );
}

export function canStartReview(user: AuthUser, item: WorkflowContentItem) {
  return (
    ['Reviewer', 'Super Admin'].includes(user.role) &&
    item.status === 'SUBMITTED'
  );
}

export function canRequestChanges(user: AuthUser, item: WorkflowContentItem) {
  return (
    ['Reviewer', 'Super Admin'].includes(user.role) &&
    (item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW')
  );
}

export function canWorkflowApprove(user: AuthUser, item: WorkflowContentItem) {
  return (
    ['Reviewer', 'Super Admin'].includes(user.role) &&
    (item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW')
  );
}

export function canWorkflowPublish(user: AuthUser, item: WorkflowContentItem) {
  return (
    ['Publisher', 'Super Admin'].includes(user.role) &&
    item.status === 'APPROVED'
  );
}
