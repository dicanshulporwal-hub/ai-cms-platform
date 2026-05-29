'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function AIGenerateContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState('5');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    if (!topic.trim()) { setError('Enter a topic.'); return; }
    setError(null); setResult(null); setLoading(true);
    try {
      const data = await apiClient<any>('/api/faqs/ai/generate', { method: 'POST', body: JSON.stringify({ topic: topic.trim(), numberOfQuestions: +numQuestions || 5 }) });
      setResult(data);
      if (!data?.generated?.faqs?.length) setError('AI returned no FAQs. Try a more specific topic.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Generation failed.'); }
    setLoading(false);
  }

  async function handleSave() {
    if (!result?.generated?.faqs?.length) return;
    setSaving(true); setError(null);
    try {
      for (const faq of result.generated.faqs) {
        const slug = (faq.question || 'faq').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80) + '-' + Date.now().toString(36).slice(-4);
        await apiClient('/api/faqs', { method: 'POST', body: JSON.stringify({ question: faq.question, answer: faq.answer, slug, seoTitle: faq.seoTitle, seoDescription: faq.seoDescription, sourceType: 'AI_GENERATED' }) });
      }
      router.push('/faqs');
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save.'); }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <Link href="/faqs"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <div><h1 className="text-2xl font-semibold">AI FAQ Generator</h1><p className="mt-1 text-sm text-muted-foreground">Generate FAQs from a topic using AI.</p></div>
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">AI-generated FAQs are saved as drafts and must be reviewed before publishing.</div>
      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      <Card><CardHeader><CardTitle>Generation Settings</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="space-y-2"><Label>Topic *</Label><Textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Citizen services, RTI process, Municipal tax payment..." rows={3} /></div>
        <div className="space-y-2"><Label>Number of Questions</Label><Input type="number" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} min="1" max="20" /></div>
        <Button onClick={handleGenerate} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate FAQs</Button>
      </CardContent></Card>
      {result?.generated?.faqs?.length > 0 && (
        <Card><CardHeader><CardTitle>Generated FAQs ({result.generated.faqs.length})</CardTitle><CardDescription>Provider: {result.provider}</CardDescription></CardHeader><CardContent className="space-y-3">
          {result.generated.faqs.map((faq: any, i: number) => (
            <div key={i} className="rounded-md border p-3">
              <p className="font-medium text-sm">{faq.question}</p>
              <p className="text-sm text-muted-foreground mt-1">{faq.answer?.slice(0, 200)}{faq.answer?.length > 200 ? '...' : ''}</p>
            </div>
          ))}
          <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save All as Drafts</Button>
        </CardContent></Card>
      )}
    </div>
  );
}

export default function AIGenerateFaqPage() {
  return <AdminPageShell sectionTitle="AI Generate FAQs">{(user) => <AIGenerateContent user={user} />}</AdminPageShell>;
}
