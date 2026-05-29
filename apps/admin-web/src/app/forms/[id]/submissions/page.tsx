'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function SubmissionsContent({ user, formId }: { user: AuthUser; formId: string }) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { apiClient<any[]>(`/api/forms/${formId}/submissions`).then(setSubmissions).catch(() => {}).finally(() => setLoading(false)); }, [formId]);

  return (
    <div className="space-y-6">
      <Link href="/forms"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Forms</Button></Link>
      <div><h1 className="text-2xl font-semibold">Form Submissions</h1></div>
      <Card><CardHeader><CardTitle>Submissions ({submissions.length})</CardTitle></CardHeader><CardContent>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : submissions.length === 0 ? <div className="text-center py-8 text-muted-foreground">No submissions yet.</div> : (
          <div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Data Preview</TableHead></TableRow></TableHeader><TableBody>
            {submissions.map(s => (
              <TableRow key={s.id}>
                <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                <TableCell><span className={['text-xs px-2 py-0.5 rounded-full', s.status === 'NEW' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'].join(' ')}>{s.status}</span></TableCell>
                <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground">{JSON.stringify(s.submissionDataJson).slice(0, 100)}</TableCell>
              </TableRow>
            ))}
          </TableBody></Table></div>
        )}
      </CardContent></Card>
    </div>
  );
}

export default function FormSubmissionsPage({ params }: { params: { id: string } }) {
  return <AdminPageShell sectionTitle="Submissions">{(user) => <SubmissionsContent user={user} formId={params.id} />}</AdminPageShell>;
}
