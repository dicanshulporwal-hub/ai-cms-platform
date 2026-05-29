'use client';

import { FormEvent, useState } from 'react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function NewFaqContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(null);
    if (!question.trim() || !answer.trim()) { setError('Question and answer are required.'); return; }
    const s = slug.trim() || question.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100);
    setLoading(true);
    try { await apiClient('/api/faqs', { method: 'POST', body: JSON.stringify({ question: question.trim(), answer: answer.trim(), slug: s }) }); router.push('/faqs'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed.'); }
    setLoading(false);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Link href="/faqs"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <h1 className="text-2xl font-semibold">Create FAQ</h1>
      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      <Card><CardHeader><CardTitle>FAQ Details</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="space-y-2"><Label>Question *</Label><Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What is...?" required /></div>
        <div className="space-y-2"><Label>Answer *</Label><Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="The answer is..." rows={5} required /></div>
        <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated-from-question" /></div>
      </CardContent></Card>
      <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Create FAQ</Button>
    </form>
  );
}

export default function NewFaqPage() {
  return <AdminPageShell sectionTitle="Create FAQ">{(user) => <NewFaqContent user={user} />}</AdminPageShell>;
}
