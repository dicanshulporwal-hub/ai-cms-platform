'use client';

import { useState } from 'react';
import { FileText, Loader2, Plus, Upload } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDeleteDocument, useDocuments, usePublishDocument } from '@/hooks/use-documents';
import type { AuthUser } from '@/types/auth';

function formatSize(bytes: number) { return (bytes / 1024 / 1024).toFixed(2) + ' MB'; }
function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }); }

function DocsContent({ user }: { user: AuthUser }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { data, isLoading } = useDocuments({ ...(search ? { search } : {}), ...(status ? { status } : {}) });
  const publishMutation = usePublishDocument();
  const deleteMutation = useDeleteDocument();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-semibold">Documents</h1><p className="mt-1 text-sm text-muted-foreground">Manage PDF and document files with AI metadata.</p></div>
        <Link href="/documents/upload"><Button><Upload className="h-4 w-4" /> Upload Document</Button></Link>
      </div>
      <Card>
        <CardHeader><CardTitle>Document Library</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input className="flex-1" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select className="w-[150px]" value={status || 'all'} onChange={(e) => setStatus(e.target.value === 'all' ? '' : e.target.value)}>
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="READY_FOR_REVIEW">Ready for Review</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </div>
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
            <div className="rounded-md border">
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Size</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data?.data?.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No documents found.</TableCell></TableRow> :
                    data?.data?.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />{doc.title}</div></TableCell>
                        <TableCell><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{doc.documentType}</span></TableCell>
                        <TableCell>{formatSize(doc.fileSize)}</TableCell>
                        <TableCell><span className={['text-xs px-2 py-0.5 rounded-full', doc.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : doc.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'].join(' ')}>{doc.status}</span></TableCell>
                        <TableCell>{formatDate(doc.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Link href={`/documents/${doc.id}/metadata`}><Button size="sm" variant="ghost">AI Metadata</Button></Link>
                            {doc.status !== 'PUBLISHED' && <Button size="sm" variant="ghost" onClick={() => publishMutation.mutateAsync(doc.id)}>Publish</Button>}
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (confirm('Delete?')) deleteMutation.mutateAsync(doc.id); }}>Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DocumentsPage() {
  return <AdminPageShell sectionTitle="Documents">{(user) => <DocsContent user={user} />}</AdminPageShell>;
}
