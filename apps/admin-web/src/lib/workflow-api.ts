import { apiClient } from '@/lib/api-client';
import type { CmsBlog } from '@/types/blog';
import type { CmsPage } from '@/types/page';
import type {
  ContentType,
  WorkflowActionInput,
  WorkflowHistoryItem,
} from '@/types/workflow';

function endpointForAction(input: WorkflowActionInput) {
  const section = input.contentType === 'PAGE' ? 'pages' : 'blogs';

  return `/api/workflow/${section}/${input.id}/${input.action}`;
}

export function getWorkflowHistory(contentType: ContentType, contentId: string) {
  return apiClient<WorkflowHistoryItem[]>(
    `/api/workflow/history/${contentType}/${contentId}`,
  );
}

export function runWorkflowAction(input: WorkflowActionInput) {
  return apiClient<CmsPage | CmsBlog>(endpointForAction(input), {
    body: JSON.stringify({ comment: input.comment }),
    method: 'POST',
  });
}
