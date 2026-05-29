'use client';

import { useState } from 'react';
import { CheckCircle, FileUp, Loader2, Plus, Sparkles, Trash2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useActivateTemplate, useDeactivateTemplate, useDeleteTemplate, useTemplates } from '@/hooks/use-templates';
import type { AuthUser } from '@/types/auth';

function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }); }

function TemplatesContent({ user }: { user: AuthUser }) {
  const { data: templates, isLoading, isError, error } = useTemplates();
  const activateMutation = useActivateTemplate();
  const deactivateMutation = useDeactivateTemplate();
  const deleteMutation = useDeleteTemplate();

  if (user.role !== 'Super Admin' && user.role !== 'Admin') {
    return <div className="text-center py-8 text-muted-foreground">Access restricted.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Website Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage frontend website templates with UX4G/GIGW readiness checks.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/templates/modules"><Button variant="outline">Modules</Button></Link>
          <Link href="/templates/upload"><Button variant="outline"><FileUp className="h-4 w-4" /> Upload ZIP</Button></Link>
          <Link href="/templates/ai-generate"><Button><Sparkles className="h-4 w-4" /> AI Generate</Button></Link>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Templates</CardTitle><CardDescription>Upload, generate, preview, and activate templates.</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> :
           isError ? <div className="text-destructive text-sm">{error?.message}</div> : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates?.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No templates yet. Upload or generate one.</TableCell></TableRow>
                  ) : templates?.map((t) => {
                    const compliance = t.complianceJson as any;
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}{t.isActive && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>}</TableCell>
                        <TableCell><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t.templateType}</span></TableCell>
                        <TableCell>{t.version}</TableCell>
                        <TableCell><span className={['text-xs px-2 py-0.5 rounded-full', t.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : t.status === 'DRAFT' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'].join(' ')}>{t.status}</span></TableCell>
                        <TableCell>{compliance?.score != null ? <span className={compliance.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}>{compliance.score}%</span> : <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell>{formatDate(t.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/templates/${t.id}/layout`}><Button size="sm" variant="ghost">Layout</Button></Link>
                            <Link href={`/templates/${t.id}/compliance`}><Button size="sm" variant="ghost">Compliance</Button></Link>
                            {t.isActive ? (
                              <Button size="sm" variant="ghost" onClick={() => deactivateMutation.mutateAsync(t.id)} disabled={deactivateMutation.isPending}><XCircle className="h-4 w-4" /> Deactivate</Button>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => activateMutation.mutateAsync(t.id)} disabled={activateMutation.isPending}><CheckCircle className="h-4 w-4" /> Activate</Button>
                            )}
                            {!t.isActive && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (confirm('Delete this template?')) deleteMutation.mutateAsync(t.id); }}><Trash2 className="h-4 w-4" /></Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TemplatesPage() {
  return <AdminPageShell sectionTitle="Templates">{(user) => <TemplatesContent user={user} />}</AdminPageShell>;
}
