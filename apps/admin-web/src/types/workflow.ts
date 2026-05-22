import type { CmsBlog } from '@/types/blog';
import type { CmsPage, PageStatus } from '@/types/page';

export type ContentType = 'PAGE' | 'BLOG';
export type WorkflowStatus = PageStatus;
export type WorkflowAction =
  | 'approve'
  | 'publish'
  | 'request-changes'
  | 'start-review'
  | 'submit';

export interface WorkflowUser {
  id: string;
  name: string;
  email: string;
}

export interface WorkflowHistoryItem {
  id: string;
  contentType: ContentType;
  contentId: string;
  fromStatus?: WorkflowStatus | null;
  toStatus: WorkflowStatus;
  action: string;
  comment?: string | null;
  performedById?: string | null;
  performedBy?: WorkflowUser | null;
  createdAt: string;
}

export interface WorkflowActionInput {
  comment?: string;
  contentType: ContentType;
  id: string;
  action: WorkflowAction;
}

export type WorkflowContentItem =
  | (CmsPage & { contentType: 'PAGE' })
  | (CmsBlog & { contentType: 'BLOG' });
