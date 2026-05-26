'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAIGenerateTemplate, useSaveAIJobAsTemplate } from '@/hooks/use-templates';
import type { AuthUser } from '@/types/auth';

function AIGenerateContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [templateType, setTemplateType] = useState('GOVERNMENT');
  const [error, setError] = useState<string | null>(null);
  const [jobResult, setJobResult] = useState<any>(null);
  const generateMutation = useAIGenerateTemplate();
  const saveMutation = useSaveAIJobAsTemplate();

  async function handleGenerate() {
    setError(null); setJobResult(null);
    try {
      const result = await generateMutation.mutateAsync({ prompt: prompt || undefined, templateType });
      setJobResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed.');
    }
  }

  async function handleSave() {
    if (!jobResult?.id) return;
    try {
      await saveMutation.mutateAsync(jobResult.id);
      router.push('/templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template.');
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/templates"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <div><h1 className="text-2xl font-semibold">AI Template Generator</h1><p className="mt-1 text-sm text-muted-foreground">Generate a UX4G/GIGW-ready website template using AI.</p></div>
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">AI-generated templates require manual review before activation.</div>
      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <Card>
        <CardHeader><CardTitle>Generation Settings</CardTitle><CardDescription>Describe the template you want to generate.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Template Type</Label>
            <Select value={templateType} onChange={(e) => setTemplateType(e.target.value)}>
              <option value="GOVERNMENT">Government</option>
              <option value="CORPORATE">Corporate</option>
              <option value="BLOG">Blog</option>
              <option value="LANDING_PAGE">Landing Page</option>
              <option value="CUSTOM">Custom</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Prompt / Instructions</Label>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Generate a GIGW-ready government department homepage with hero section, announcements, and services grid..." rows={4} />
          </div>
          <Button onClick={handleGenerate} disabled={generateMutation.isPending}>{generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate Template</Button>
        </CardContent>
      </Card>

      {jobResult && (
        <Card>
          <CardHeader><CardTitle>Generation Result</CardTitle><CardDescription>Status: {jobResult.status}</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {jobResult.status === 'COMPLETED' && jobResult.generatedHtml && (
              <>
                <div className="rounded-md border p-4 max-h-96 overflow-auto bg-muted/30">
                  <pre className="text-xs whitespace-pre-wrap">{jobResult.generatedHtml.substring(0, 3000)}{jobResult.generatedHtml.length > 3000 ? '...' : ''}</pre>
                </div>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>{saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save as Draft Template</Button>
              </>
            )}
            {jobResult.status === 'FAILED' && <p className="text-destructive text-sm">{jobResult.errorMessage}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AIGeneratePage() {
  return <AdminPageShell sectionTitle="AI Generate Template">{(user) => <AIGenerateContent user={user} />}</AdminPageShell>;
}
