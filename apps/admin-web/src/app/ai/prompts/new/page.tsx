'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
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

const TASK_TYPES = [
  'CONTENT_GENERATION', 'CONTENT_REWRITE', 'SUMMARIZATION', 'SEO_GENERATION',
  'FAQ_GENERATION', 'CHATBOT', 'DOCUMENT_METADATA', 'TEMPLATE_GENERATION',
  'TRANSLATION', 'FORM_GENERATION', 'SCHEMA_GENERATION',
  'ACCESSIBILITY_RECOMMENDATION', 'BROKEN_LINK_RECOMMENDATION', 'PROMPT_CUSTOM',
];

function NewPromptContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    promptKey: '', name: '', description: '', taskType: 'CONTENT_GENERATION', moduleKey: '',
    systemPrompt: '', userPromptTemplate: '', temperature: 0.7, maxTokens: 1200,
  });

  async function handleSave() {
    if (!form.promptKey || !form.name || !form.systemPrompt || !form.userPromptTemplate) {
      setError('Prompt key, name, system prompt, and user prompt template are required.');
      return;
    }
    setSaving(true); setError(null);
    try {
      const result = await apiClient<any>('/api/ai-prompts', { method: 'POST', body: JSON.stringify(form) });
      router.push(`/ai/prompts/${result.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to create.'); }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/ai/prompts"><Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
        <h1 className="text-2xl font-semibold">Create AI Prompt</h1>
      </div>

      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <Card>
        <CardHeader><CardTitle className="text-base">Prompt Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Prompt Key *</Label><Input value={form.promptKey} onChange={(e) => setForm(f => ({ ...f, promptKey: e.target.value }))} placeholder="content_generation" /><p className="text-xs text-muted-foreground">Unique identifier used in code</p></div>
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Content Generation Prompt" /></div>
            <div className="space-y-2"><Label>Task Type</Label><Select value={form.taskType} onChange={(e) => setForm(f => ({ ...f, taskType: e.target.value }))}>{TASK_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</Select></div>
            <div className="space-y-2"><Label>Module Key</Label><Input value={form.moduleKey} onChange={(e) => setForm(f => ({ ...f, moduleKey: e.target.value }))} placeholder="pages, blogs, etc." /></div>
          </div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What this prompt does..." rows={2} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Prompt Content</CardTitle><CardDescription>Use {'{{variable}}'} placeholders for dynamic content.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>System Prompt *</Label><Textarea value={form.systemPrompt} onChange={(e) => setForm(f => ({ ...f, systemPrompt: e.target.value }))} placeholder="You are an AI assistant for a CMS..." rows={4} className="font-mono text-sm" /></div>
          <div className="space-y-2"><Label>User Prompt Template *</Label><Textarea value={form.userPromptTemplate} onChange={(e) => setForm(f => ({ ...f, userPromptTemplate: e.target.value }))} placeholder="Generate content about {{topic}} in {{language}}..." rows={6} className="font-mono text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Temperature</Label><Input type="number" min={0} max={2} step={0.1} value={form.temperature} onChange={(e) => setForm(f => ({ ...f, temperature: parseFloat(e.target.value) }))} /></div>
            <div className="space-y-2"><Label>Max Tokens</Label><Input type="number" min={100} max={4000} step={100} value={form.maxTokens} onChange={(e) => setForm(f => ({ ...f, maxTokens: parseInt(e.target.value) }))} /></div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Create Prompt</Button>
    </div>
  );
}

export default function NewPromptPage() {
  return <AdminPageShell sectionTitle="New AI Prompt">{(user) => <NewPromptContent user={user} />}</AdminPageShell>;
}
