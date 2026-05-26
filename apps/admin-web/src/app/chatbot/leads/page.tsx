'use client';

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
import { useChatbotLeads } from '@/hooks/use-chatbot';
import type { ChatbotLead } from '@/types/chatbot';

function LeadsContent() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<ChatbotLead | null>(null);
  const leadsQuery = useChatbotLeads(appliedSearch);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Chatbot leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review leads captured from the public chatbot widget.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Captured leads</CardTitle>
          <CardDescription>Search by name or email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="lead-search">Search leads</Label>
              <Input
                id="lead-search"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="name@example.com"
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

          {leadsQuery.isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading leads
            </div>
          ) : leadsQuery.isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {leadsQuery.error.message}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Source page</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(leadsQuery.data?.data ?? []).map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <p className="font-medium">{lead.name ?? 'Unknown'}</p>
                      {lead.message ? (
                        <p className="max-w-xs truncate text-xs text-muted-foreground">
                          {lead.message}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>{lead.email ?? 'No email'}</TableCell>
                    <TableCell>{lead.phone ?? 'Not provided'}</TableCell>
                    <TableCell>{lead.sourcePage ?? 'Unknown'}</TableCell>
                    <TableCell>{new Date(lead.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => setSelectedLead(lead)}
                        type="button"
                        variant="outline"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {leadsQuery.data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell className="py-8 text-center text-muted-foreground" colSpan={6}>
                      No leads found.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedLead ? (
        <Card>
          <CardHeader>
            <CardTitle>Lead detail</CardTitle>
            <CardDescription>{selectedLead.email}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{selectedLead.name ?? 'Unknown'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{selectedLead.phone ?? 'Not provided'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Source page</p>
              <p className="font-medium">{selectedLead.sourcePage ?? 'Unknown'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Conversation</p>
              <p className="font-medium">
                {selectedLead.conversationId ?? 'Not linked'}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-muted-foreground">Message</p>
              <p className="whitespace-pre-wrap font-medium">
                {selectedLead.message ?? 'No message provided.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export default function ChatbotLeadsPage() {
  return (
    <AdminPageShell sectionTitle="Chatbot Leads">
      {() => <LeadsContent />}
    </AdminPageShell>
  );
}
