'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useChatbotConversations } from '@/hooks/use-chatbot';

function ConversationsContent() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const conversationsQuery = useChatbotConversations(appliedSearch);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Chatbot conversations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review visitor questions and chatbot answers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>Search by visitor or bot message content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="conversation-search">Search messages</Label>
              <Input
                id="conversation-search"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="pricing, demo, support"
                value={search}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={() => setAppliedSearch(search.trim())} type="button">
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button
                onClick={() => {
                  setSearch('');
                  setAppliedSearch('');
                }}
                type="button"
                variant="outline"
              >
                Clear
              </Button>
            </div>
          </div>

          {conversationsQuery.isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading conversations
            </div>
          ) : conversationsQuery.isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {conversationsQuery.error.message}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conversation</TableHead>
                  <TableHead>Source page</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(conversationsQuery.data?.data ?? []).map((conversation) => (
                  <TableRow key={conversation.id}>
                    <TableCell>
                      <p className="font-medium">{conversation.preview || 'No preview'}</p>
                      {conversation.lead ? (
                        <p className="text-xs text-muted-foreground">
                          Lead: {conversation.lead.email}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>{conversation.sourcePage ?? 'Unknown'}</TableCell>
                    <TableCell>{conversation.messageCount}</TableCell>
                    <TableCell>{new Date(conversation.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Link className="text-sm font-medium text-primary" href={`/chatbot/conversations/${conversation.id}`}>
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {conversationsQuery.data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell className="py-8 text-center text-muted-foreground" colSpan={5}>
                      No conversations found.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ChatbotConversationsPage() {
  return (
    <AdminPageShell sectionTitle="Chatbot Conversations">
      {() => <ConversationsContent />}
    </AdminPageShell>
  );
}
