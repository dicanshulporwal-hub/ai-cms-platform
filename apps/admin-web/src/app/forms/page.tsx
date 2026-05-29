'use client';

import { useEffect, useState } from 'react';
import { FileText, Loader2, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function FormsContent({ user }: { user: AuthUser }) {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { apiClient<any[]>('/api/forms').then(setForms).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Forms</h1><p className="mt-1 text-sm text-muted-foreground">Create and manage dynamic forms for public submission.</p></div>
        <div className="flex gap-2">
          <Link href="/forms/ai-generate"><Button variant="outline"><Sparkles className="h-4 w-4" /> AI Generate</Button></Link>
          <Link href="/forms/new"><Button><Plus className="h-4 w-4" /> Create Form</Button></Link>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>All Forms</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : forms.length === 0 ? <div className="text-center py-8 text-muted-foreground">No forms yet.</div> : (
            <div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Fields</TableHead><TableHead>Submissions</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
              {forms.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.title}</TableCell>
                  <TableCell><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{f.formType}</span></TableCell>
                  <TableCell><span className={['text-xs px-2 py-0.5 rounded-full', f.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'].join(' ')}>{f.status}</span></TableCell>
                  <TableCell>{f._count?.fields ?? 0}</TableCell>
                  <TableCell>{f._count?.submissions ?? 0}</TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-1"><Link href={`/forms/${f.id}/builder`}><Button size="sm" variant="ghost">Builder</Button></Link><Link href={`/forms/${f.id}/submissions`}><Button size="sm" variant="ghost">Submissions</Button></Link></div></TableCell>
                </TableRow>
              ))}
            </TableBody></Table></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function FormsPage() {
  return <AdminPageShell sectionTitle="Forms">{(user) => <FormsContent user={user} />}</AdminPageShell>;
}
