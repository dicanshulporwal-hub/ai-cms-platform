'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function FaqsContent({ user }: { user: AuthUser }) {
  const [faqs, setFaqs] = useState<any>({ data: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => { load(); }, [search]);
  async function load() { setLoading(true); try { const data = await apiClient<any>(`/api/faqs${search ? `?search=${search}` : ''}`); setFaqs(data); } catch {} setLoading(false); }

  async function publishFaq(id: string) { try { await apiClient(`/api/faqs/${id}/publish`, { method: 'POST' }); await load(); } catch {} }
  async function deleteFaq(id: string) { if (!confirm('Delete?')) return; try { await apiClient(`/api/faqs/${id}`, { method: 'DELETE' }); await load(); } catch {} }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">FAQs</h1><p className="mt-1 text-sm text-muted-foreground">Manage frequently asked questions.</p></div>
        <div className="flex gap-2">
          <Link href="/faqs/ai-generate"><Button variant="outline"><Sparkles className="h-4 w-4" /> AI Generate</Button></Link>
          <Link href="/faqs/new"><Button><Plus className="h-4 w-4" /> Create FAQ</Button></Link>
        </div>
      </div>
      <Card><CardHeader><CardTitle>All FAQs ({faqs.total ?? faqs.data?.length ?? 0})</CardTitle></CardHeader><CardContent className="space-y-4">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search FAQs..." />
        {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : faqs.data?.length === 0 ? <div className="text-center py-8 text-muted-foreground">No FAQs yet.</div> : (
          <div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>Question</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Featured</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
            {faqs.data?.map((f: any) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium max-w-[300px] truncate">{f.question}</TableCell>
                <TableCell>{f.category?.name ?? '-'}</TableCell>
                <TableCell><span className={['text-xs px-2 py-0.5 rounded-full', f.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'].join(' ')}>{f.status}</span></TableCell>
                <TableCell>{f.isFeatured ? '⭐' : '-'}</TableCell>
                <TableCell className="text-right"><div className="flex justify-end gap-1">
                  <Link href={`/faqs/${f.id}/edit`}><Button size="sm" variant="ghost">Edit</Button></Link>
                  {f.status !== 'PUBLISHED' && <Button size="sm" variant="ghost" onClick={() => publishFaq(f.id)}>Publish</Button>}
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteFaq(f.id)}>Delete</Button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody></Table></div>
        )}
      </CardContent></Card>
    </div>
  );
}

export default function FaqsPage() {
  return <AdminPageShell sectionTitle="FAQs">{(user) => <FaqsContent user={user} />}</AdminPageShell>;
}
