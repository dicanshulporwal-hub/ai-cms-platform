'use client';

import Link from 'next/link';
import { Loader2, MessageCircle, Settings, Users } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button, buttonClassName } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useChatbotAnalytics } from '@/hooks/use-chatbot';

function ChatbotDashboardContent() {
  const analyticsQuery = useChatbotAnalytics();
  const analytics = analyticsQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <MessageCircle className="h-6 w-6 text-primary" />
            Chatbot
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor public chatbot conversations, captured leads, and settings.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className={buttonClassName({ variant: 'outline' })} href="/chatbot/conversations">
            Conversations
          </Link>
          <Link className={buttonClassName({ variant: 'outline' })} href="/chatbot/leads">
            Leads
          </Link>
          <Link className={buttonClassName({})} href="/chatbot/settings">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      {analyticsQuery.isLoading ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading chatbot analytics
        </div>
      ) : analyticsQuery.isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {analyticsQuery.error.message}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">
                {analytics?.totalConversations ?? 0}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">
                {analytics?.totalMessages ?? 0}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-5 w-5 text-primary" />
                  Leads
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">
                {analytics?.totalLeads ?? 0}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top source pages</CardTitle>
              <CardDescription>Pages where visitors started conversations.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source page</TableHead>
                    <TableHead>Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(analytics?.topSourcePages ?? []).map((source) => (
                    <TableRow key={source.sourcePage ?? 'unknown'}>
                      <TableCell>{source.sourcePage ?? 'Unknown'}</TableCell>
                      <TableCell>{source.count}</TableCell>
                    </TableRow>
                  ))}
                  {analytics?.topSourcePages.length === 0 ? (
                    <TableRow>
                      <TableCell className="py-8 text-center text-muted-foreground" colSpan={2}>
                        No source pages yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function ChatbotPage() {
  return (
    <AdminPageShell sectionTitle="Chatbot">
      {() => <ChatbotDashboardContent />}
    </AdminPageShell>
  );
}
