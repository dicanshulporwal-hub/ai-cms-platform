'use client';

import { FormEvent, useState } from 'react';
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

const PROVIDER_OPTIONS = [
  { key: 'GEMINI', name: 'Google Gemini / AI Studio', note: 'Free-tier available' },
  { key: 'OPENAI', name: 'OpenAI', note: 'Paid API' },
  { key: 'ANTHROPIC', name: 'Anthropic Claude', note: 'Future - Paid' },
  { key: 'MISTRAL', name: 'Mistral AI', note: 'Future - Free tier available' },
  { key: 'GROQ', name: 'Groq', note: 'Future - Free tier available' },
  { key: 'COHERE', name: 'Cohere', note: 'Future - Optional' },
  { key: 'AZURE_OPENAI', name: 'Azure OpenAI', note: 'Future - Paid' },
  { key: 'LOCAL_LLM', name: 'Local LLM / Ollama', note: 'Free - Self-hosted' },
  { key: 'CUSTOM', name: 'Custom Provider', note: 'Custom API endpoint' },
];

function AddProviderContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [providerKey, setProviderKey] = useState('');
  const [providerName, setProviderName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [defaultTextModel, setDefaultTextModel] = useState('');
  const [defaultVisionModel, setDefaultVisionModel] = useState('');
  const [pricingNotes, setPricingNotes] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleProviderChange(key: string) {
    setProviderKey(key);
    const opt = PROVIDER_OPTIONS.find(p => p.key === key);
    if (opt) {
      setProviderName(opt.name);
      setPricingNotes(opt.note);
    }
    // Set default models
    if (key === 'GEMINI') { setDefaultTextModel('gemini-2.5-flash'); setDefaultVisionModel('gemini-2.5-flash'); }
    else if (key === 'OPENAI') { setDefaultTextModel('gpt-4o-mini'); setDefaultVisionModel('gpt-4o'); }
    else { setDefaultTextModel(''); setDefaultVisionModel(''); }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(null);
    if (!providerKey) { setError('Select a provider.'); return; }
    if (!providerName.trim()) { setError('Provider name is required.'); return; }
    setLoading(true);
    try {
      await apiClient('/api/ai-providers', {
        method: 'POST',
        body: JSON.stringify({
          providerKey, providerName: providerName.trim(),
          apiKey: apiKey.trim() || undefined,
          baseUrl: baseUrl.trim() || undefined,
          defaultTextModel: defaultTextModel.trim() || undefined,
          defaultVisionModel: defaultVisionModel.trim() || undefined,
          pricingNotes: pricingNotes.trim() || undefined,
          isEnabled, isDefault,
        }),
      });
      router.push('/ai/providers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add provider.');
    }
    setLoading(false);
  }

  if (user.role !== 'Super Admin') return <div className="text-center py-8 text-muted-foreground">Only Super Admin can add providers.</div>;

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Link href="/ai/providers"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <div><h1 className="text-2xl font-semibold">Add AI Provider</h1><p className="mt-1 text-sm text-muted-foreground">Configure a new AI provider with API key and model settings.</p></div>
      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <Card>
        <CardHeader><CardTitle>Provider Settings</CardTitle><CardDescription>Select provider and configure connection.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Provider *</Label>
              <Select value={providerKey} onChange={(e) => handleProviderChange(e.target.value)}>
                <option value="">Select provider...</option>
                {PROVIDER_OPTIONS.map(p => <option key={p.key} value={p.key}>{p.name} ({p.note})</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Display Name *</Label>
              <Input value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="Google Gemini" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter API key (stored encrypted)" />
            <p className="text-xs text-muted-foreground">Key is encrypted before storage. Never shown again after saving.</p>
          </div>
          <div className="space-y-2">
            <Label>Base URL (optional)</Label>
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.example.com/v1" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Default Text Model</Label>
              <Input value={defaultTextModel} onChange={(e) => setDefaultTextModel(e.target.value)} placeholder="e.g. gemini-2.5-flash" />
            </div>
            <div className="space-y-2">
              <Label>Default Vision Model</Label>
              <Input value={defaultVisionModel} onChange={(e) => setDefaultVisionModel(e.target.value)} placeholder="e.g. gemini-2.5-flash" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Pricing Notes</Label>
            <Textarea value={pricingNotes} onChange={(e) => setPricingNotes(e.target.value)} placeholder="e.g. Free tier with rate limits" rows={2} />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} className="rounded" /> Enabled</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded" /> Set as Default</label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Provider</Button>
        <Link href="/ai/providers"><Button type="button" variant="outline">Cancel</Button></Link>
      </div>
    </form>
  );
}

export default function NewProviderPage() {
  return <AdminPageShell sectionTitle="Add AI Provider">{(user) => <AddProviderContent user={user} />}</AdminPageShell>;
}
