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
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function AIGenerateContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [purpose, setPurpose] = useState('');
  const [formType, setFormType] = useState('CUSTOM');
  const [audience, setAudience] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    if (!purpose.trim()) { setError('Describe the form purpose.'); return; }
    setError(null); setResult(null); setLoading(true);
    try {
      const data = await apiClient<any>('/api/forms/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ formPurpose: purpose, formType, targetAudience: audience || undefined, additionalInstructions: instructions || undefined }),
      });
      setResult(data);
      if (!data?.generated || Object.keys(data.generated).length === 0) {
        setError('AI returned empty result. Please try again with a more detailed description.');
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Generation failed. Check if AI provider is configured and API is running.'); }
    setLoading(false);
  }

  async function handleSave() {
    if (!result?.generated?.title) { setError('No generated form to save.'); return; }
    setSaving(true); setError(null);
    try {
      const gen = result.generated;
      const slug = (gen.title || 'ai-form').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) + '-' + Date.now().toString(36);
      const form = await apiClient<any>('/api/forms', {
        method: 'POST',
        body: JSON.stringify({ title: gen.title, slug, description: gen.description, formType: gen.formType || formType, successMessage: gen.successMessage, submitButtonLabel: gen.submitButtonLabel }),
      });
      // Add generated fields
      if (gen.fields?.length) {
        for (let i = 0; i < gen.fields.length; i++) {
          const f = gen.fields[i];
          await apiClient(`/api/forms/${form.id}/fields`, {
            method: 'POST',
            body: JSON.stringify({ fieldKey: f.fieldKey || `field_${i}`, label: f.label, fieldType: f.fieldType || 'TEXT', isRequired: f.isRequired ?? false, placeholder: f.placeholder, helpText: f.helpText, sortOrder: i }),
          });
        }
      }
      router.push(`/forms/${form.id}/builder`);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save.'); }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <Link href="/forms"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <div><h1 className="text-2xl font-semibold">AI Form Generator</h1><p className="mt-1 text-sm text-muted-foreground">Describe the form you need and AI will generate it.</p></div>
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">AI-generated forms are saved as drafts and must be reviewed before publishing.</div>
      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <Card>
        <CardHeader><CardTitle>Generation Settings</CardTitle><CardDescription>Describe what kind of form you need.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Form Purpose *</Label><Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Create a grievance form for citizens to report issues with municipal services" rows={3} /></div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><Label>Form Type</Label><Select value={formType} onChange={(e) => setFormType(e.target.value)}><option value="CUSTOM">Custom</option><option value="CONTACT">Contact</option><option value="FEEDBACK">Feedback</option><option value="GRIEVANCE">Grievance</option><option value="SURVEY">Survey</option><option value="REGISTRATION">Registration</option><option value="APPLICATION">Application</option></Select></div>
            <div className="space-y-2"><Label>Target Audience</Label><Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Citizens, Students" /></div>
          </div>
          <div className="space-y-2"><Label>Additional Instructions</Label><Input value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. Include mobile number and file upload field" /></div>
          <Button onClick={handleGenerate} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate Form</Button>
        </CardContent>
      </Card>

      {result?.generated && Object.keys(result.generated).length > 0 && (
        <Card>
          <CardHeader><CardTitle>Generated Form</CardTitle><CardDescription>Provider: {result.provider} • Model: {result.model}</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4 space-y-2">
              <p className="font-medium">{result.generated.title || 'Untitled'}</p>
              <p className="text-sm text-muted-foreground">{result.generated.description || ''}</p>
              {result.generated.fields?.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Fields ({result.generated.fields.length}):</p>
                  {result.generated.fields.map((f: any, i: number) => (
                    <div key={i} className="text-sm flex gap-2">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <span>{f.label}</span>
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{f.fieldType}</span>
                      {f.isRequired && <span className="text-xs text-destructive">required</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save as Draft Form</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AIGenerateFormPage() {
  return <AdminPageShell sectionTitle="AI Generate Form">{(user) => <AIGenerateContent user={user} />}</AdminPageShell>;
}
