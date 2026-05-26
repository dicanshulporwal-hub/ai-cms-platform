'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useChatbotConversation } from '@/hooks/use-chatbot';

function ConversationDetailContent() {
  const params = useParams<{ id: string }>();
  const conversationQuery = useChatbotConversation(params.id);
  const conversation = conversationQuery.data;

  if (conversationQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading conversation
      </div>
    );
  }

  if (conversationQuery.isError || !conversation) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {conversationQuery.error?.message ?? 'Conversation not found.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm text-primary" href="/chatbot/conversations">
          Back to conversations
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Conversation detail</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Source: {conversation.sourcePage ?? 'Unknown'}
        </p>
      </div>

      {conversation.lead ? (
        <Card>
          <CardHeader>
            <CardTitle>Captured lead</CardTitle>
            <CardDescription>{conversation.lead.email}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{conversation.lead.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{conversation.lead.phone ?? 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>Visitor and bot messages in order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {conversation.messages.map((message) => (
            <div
              className={[
                'max-w-3xl rounded-md border border-border p-3 text-sm',
                message.senderType === 'VISITOR'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'bg-muted',
              ].join(' ')}
              key={message.id}
            >
              <p className="text-xs opacity-80">
                {message.senderType} - {new Date(message.createdAt).toLocaleString()}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{message.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ChatbotConversationDetailPage() {
  return (
    <AdminPageShell sectionTitle="Conversation">
      {() => <ConversationDetailContent />}
    </AdminPageShell>
  );
}
