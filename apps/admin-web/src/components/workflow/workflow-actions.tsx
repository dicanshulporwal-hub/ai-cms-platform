'use client';

import {
  Loader2,
  MessageSquareWarning,
  PlayCircle,
  Send,
  Stamp,
  UploadCloud,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWorkflowAction } from '@/hooks/use-workflow';
import {
  canRequestChanges,
  canStartReview,
  canWorkflowApprove,
  canWorkflowPublish,
  canWorkflowSubmit,
} from '@/lib/workflow-permissions';
import type { AuthUser } from '@/types/auth';
import type { WorkflowAction, WorkflowContentItem } from '@/types/workflow';

interface WorkflowActionsProps {
  item: WorkflowContentItem;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

const actionLabels: Record<WorkflowAction, string> = {
  approve: 'Approve',
  publish: 'Publish',
  'request-changes': 'Request changes',
  'start-review': 'Mark under review',
  submit: 'Submit',
};

export function WorkflowActions({
  item,
  onError,
  onSuccess,
  user,
}: WorkflowActionsProps & { user: AuthUser }) {
  const workflowMutation = useWorkflowAction();
  const [pendingAction, setPendingAction] = useState<WorkflowAction | null>(null);

  async function runAction(action: WorkflowAction) {
    let comment: string | undefined;

    if (action === 'request-changes') {
      const enteredComment = window.prompt('What changes are needed?');

      if (!enteredComment?.trim()) {
        onError?.('A comment is required when requesting changes.');
        return;
      }

      comment = enteredComment.trim();
    }

    setPendingAction(action);
    onError?.('');
    onSuccess?.('');

    try {
      await workflowMutation.mutateAsync({
        action,
        comment,
        contentType: item.contentType,
        id: item.id,
      });
      onSuccess?.(`${actionLabels[action]} completed.`);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Workflow action failed.');
    } finally {
      setPendingAction(null);
    }
  }

  const actions: Array<{
    action: WorkflowAction;
    icon: LucideIcon;
    show: boolean;
    variant?: 'default' | 'outline';
  }> = [
    {
      action: 'submit',
      icon: Send,
      show: canWorkflowSubmit(user, item),
      variant: 'outline',
    },
    {
      action: 'start-review',
      icon: PlayCircle,
      show: canStartReview(user, item),
      variant: 'outline',
    },
    {
      action: 'request-changes',
      icon: MessageSquareWarning,
      show: canRequestChanges(user, item),
      variant: 'outline',
    },
    {
      action: 'approve',
      icon: Stamp,
      show: canWorkflowApprove(user, item),
      variant: 'outline',
    },
    {
      action: 'publish',
      icon: UploadCloud,
      show: canWorkflowPublish(user, item),
      variant: 'default',
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions
        .filter((action) => action.show)
        .map(({ action, icon: Icon, variant }) => {
          const isPending = pendingAction === action;

          return (
            <Button
              className="h-9 px-3"
              disabled={workflowMutation.isPending}
              key={action}
              onClick={() => void runAction(action)}
              type="button"
              variant={variant}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              {actionLabels[action]}
            </Button>
          );
        })}
    </div>
  );
}
