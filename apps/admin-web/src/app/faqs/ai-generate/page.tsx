'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Loader2, Plus, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function AIGenerateContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [mode, setMode] = useState<'topic' | 'content'>('content');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState('5');
  const [sourceType, setSourceType] = useState('PAGE');
  const [sourceId, setSourceId] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [existingFaqs, setExistingFaqs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSources, setLoadingSources] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Load pages/blogs/documents for source selection
  useEffect(() => { loadSources(); }, [sourceType]);

  // Load existing FAQs for selected source
  useEffect(() => { if (sourceId) loadExistingFaqs(); else setExistingFaqs([]); }, [sourceId]);

  async function loadSources() {
    setLoadingSources(true); setSources([]);
    try {
      if (sourceType === 'PAGE') {
        const data = await apiClient<any>('/api/pages?limit=100');
        setSources((data.data ?? data).map((p: any) => ({ id: p.id, title: p.title, slug: p.slug })));
      } else if (sourceType === 'BLOG') {
        const data = await apiClient<any>('/api/blogs?limit=100');
        setSources((data.data ?? data).map((b: any) => ({ id: b.id, title: b.title, slug: b.slug })));
      } else if (sourceType === 'DOCUMENT') {
        const data = await apiClient<any>('/api/documents?limit=100');
        setSources((data.data ?? data).map((d: any) => ({ id: d.id, title: d.title, slug: d.slug })));
      }
    } catch {} setLoadingSources(false);
  }

  async function loadExistingFaqs() {
    try {
      const data = await apiClient<any>('/api/faqs?limit=100');
      const faqs = (data.data ?? []).filter((f: any) => f.sourceType === sourceType && f.sourceId === sourceId);
      setExistingFaqs(faqs);
    } catch { setExistingFaqs([]); }
  }

  async function handleGenerate() {
    setError(null); setResult(null);
    if (mode === 'topic' && !topic.trim()) { setError('Enter a topic.'); return; }
    if (mode === 'content' && !sourceId) { setError('Select a source page/blog/document.'); return; }
    setLoading(true);
    try {
      let data: any;
      if (mode === 'content') {
        data = await apiClient<any>('/api/faqs/ai/generate-from-content', { method: 'POST', body: JSON.stringify({ sourceType, sourceId, numberOfQuestions: +numQuestions || 5 }) });
      } else {
        data = await apiClient<any>('/api/faqs/ai/generate', { method: 'POST', body: JSON.stringify({ topic: topic.trim(), numberOfQuestions: +numQuestions || 5 }) });
      }
      setResult(data);
      if (!data?.generated?.faqs?.length) setError('AI returned no FAQs. Try a different source or more specific topic.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Generation failed.'); }
    setLoading(false);
  }

  async function handleSave() {
    if (!result?.generated?.faqs?.length) return;
    setSaving(true); setError(null);
    try {
      for (const faq of result.generated.faqs) {
        const slug = (faq.question || 'faq').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80) + '-' + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(-3);
        await apiClient('/api/faqs', { method: 'POST', body: JSON.stringify({ question: faq.question, answer: faq.answer, slug, seoTitle: faq.seoTitle, seoDescription: faq.seoDescription, sourceType: mode === 'content' ? sourceType : 'AI_GENERATED', sourceId: mode === 'content' ? sourceId : undefined }) });
      }
      if (sourceId) await loadExistingFaqs();
      setResult(null);
      router.push('/faqs');
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save.'); }
    setSaving(false);
  }

  const selectedSource = sources.find(s => s.id === sourceId);

  return (
    <div className="space-y-6">
      <Link href="/faqs"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <div><h1 className="text-2xl font-semibold">AI FAQ Generator</h1><p className="mt-1 text-sm text-muted-foreground">Generate FAQs from existing content or a topic.</p></div>
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">AI-generated FAQs are saved as drafts and must be reviewed before publishing.</div>
      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      {/* Mode selector */}
      <Card>
        <CardHeader><CardTitle>Generation Mode</CardTitle><CardDescription>Choose how to generate FAQs.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button variant={mode === 'content' ? 'default' : 'outline'} onClick={() => setMode('content')}><FileText className="h-4 w-4" /> From Page/Blog/Document</Button>
            <Button variant={mode === 'topic' ? 'default' : 'outline'} onClick={() => setMode('topic')}><Sparkles className="h-4 w-4" /> From Topic</Button>
          </div>

          {mode === 'content' && (
            <div className="space-y-4 pt-2">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Source Type</Label>
                  <Select value={sourceType} onChange={(e) => { setSourceType(e.target.value); setSourceId(''); }}>
                    <option value="PAGE">Page</option>
                    <option value="BLOG">Blog Post</option>
                    <option value="DOCUMENT">Document</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select {sourceType === 'PAGE' ? 'Page' : sourceType === 'BLOG' ? 'Blog' : 'Document'} *</Label>
                  {loadingSources ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div> : (
                    <Select value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
                      <option value="">Select...</option>
                      {sources.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </Select>
                  )}
                </div>
              </div>
              {selectedSource && <p className="text-sm text-muted-foreground">Selected: <strong>{selectedSource.title}</strong></p>}
            </div>
          )}

          {mode === 'topic' && (
            <div className="space-y-2 pt-2">
              <Label>Topic *</Label>
              <Textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Citizen services, RTI process, Municipal tax payment..." rows={3} />
            </div>
          )}

          <div className="space-y-2">
            <Label>Number of Questions</Label>
            <Input type="number" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} min="1" max="20" className="w-32" />
          </div>

          <Button onClick={handleGenerate} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate FAQs</Button>
        </CardContent>
      </Card>

      {/* Existing FAQs for selected source */}
      {existingFaqs.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Existing FAQs for this {sourceType.toLowerCase()} ({existingFaqs.length})</CardTitle><CardDescription>These FAQs were previously generated from this source.</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {existingFaqs.map((faq: any) => (
              <div key={faq.id} className="rounded-md border p-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{faq.question}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{faq.answer?.slice(0, 100)}...</p>
                </div>
                <span className={['text-xs px-2 py-0.5 rounded-full shrink-0', faq.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'].join(' ')}>{faq.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Generated results */}
      {result?.generated?.faqs?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Generated FAQs ({result.generated.faqs.length})</CardTitle><CardDescription>Provider: {result.provider} • Model: {result.model}</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {result.generated.faqs.map((faq: any, i: number) => (
              <div key={i} className="rounded-md border p-3">
                <p className="font-medium text-sm">{faq.question}</p>
                <p className="text-sm text-muted-foreground mt-1">{faq.answer?.slice(0, 200)}{faq.answer?.length > 200 ? '...' : ''}</p>
              </div>
            ))}
            <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save All as Drafts</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AIGenerateFaqPage() {
  return <AdminPageShell sectionTitle="AI Generate FAQs">{(user) => <AIGenerateContent user={user} />}</AdminPageShell>;
}
