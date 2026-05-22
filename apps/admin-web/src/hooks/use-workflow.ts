import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getWorkflowHistory,
  runWorkflowAction,
} from '@/lib/workflow-api';
import type {
  ContentType,
  WorkflowActionInput,
} from '@/types/workflow';

export function useWorkflowHistory(contentType: ContentType, contentId: string) {
  return useQuery({
    enabled: Boolean(contentId),
    queryFn: () => getWorkflowHistory(contentType, contentId),
    queryKey: ['workflow-history', contentType, contentId],
  });
}

export function useWorkflowAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WorkflowActionInput) => runWorkflowAction(input),
    onSuccess: (_data, variables) => {
      const contentQueryKey = variables.contentType === 'PAGE' ? 'pages' : 'blogs';

      queryClient.invalidateQueries({ queryKey: [contentQueryKey] });
      queryClient.invalidateQueries({
        queryKey: ['workflow-history', variables.contentType, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
    },
  });
}
