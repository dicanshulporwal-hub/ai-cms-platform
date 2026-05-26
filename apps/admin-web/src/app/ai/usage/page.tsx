'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
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
import { useAiUsage } from '@/hooks/use-ai';

function AIUsageContent() {
  const [actionFilter, setActionFilter] = useState('');
  const [appliedAction, setAppliedAction] = useState('');
  const usageQuery = useAiUsage(appliedAction || undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Sparkles className="h-6 w-6 text-primary" />
          AI usage
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review AI assistant requests, providers, models, and usage metadata.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage logs</CardTitle>
          <CardDescription>
            Admins see all logs. Other roles see their own AI requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="ai-action-filter">Filter by action</Label>
              <Input
                id="ai-action-filter"
                onChange={(event) => setActionFilter(event.target.value)}
                placeholder="generate-content"
                value={actionFilter}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={() => setAppliedAction(actionFilter.trim())}
                type="button"
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setActionFilter('');
                  setAppliedAction('');
                }}
                type="button"
                variant="outline"
              >
                Clear
              </Button>
            </div>
          </div>

          {usageQuery.isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading AI usage
            </div>
          ) : usageQuery.isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {usageQuery.error.message}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(usageQuery.data?.data ?? []).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {log.user ? (
                          <div>
                            <p className="font-medium">{log.user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.user.email}
                            </p>
                          </div>
                        ) : (
                          'Unknown'
                        )}
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.provider}</TableCell>
                      <TableCell>{log.model ?? 'Not reported'}</TableCell>
                      <TableCell>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {usageQuery.data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell
                        className="py-8 text-center text-muted-foreground"
                        colSpan={5}
                      >
                        No AI usage logs found.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AIUsagePage() {
  return (
    <AdminPageShell sectionTitle="AI Usage">
      {() => <AIUsageContent />}
    </AdminPageShell>
  );
}
