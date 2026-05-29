'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApplyAIMetadata, useDocument, useGenerateMetadata } from '@/hooks/use-documents';
import type { AuthUser } from '@/types/auth';

function MetadataContent({ user, docId }: { user: AuthUser; docId: string }) {
  const { data: doc, isLoading, refetch } = useDocument(docId);
  const generateMutation = useGenerateMetadata();
  const applyMutation = useApplyAIMetadata();
  const [jobResult, setJobResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null); setSuccess(null); setJobResult(null);
    try { const result = await generateMutation.mutateAsync(docId); setJobResult(result); }
    catch (err) { setError(err instanceof Error ? err.message : 'Generation failed.'); }
  }

  async function handleApply() {
    if (!jobResult?.id) return;
    setError(null);
    try { await applyMutation.mutateAsync({ id: docId, jobId: jobResult.id }); setSuccess('AI metadata applied.'); refetch(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to apply.'); }
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!doc) return <div className="text-destructive">Document not found.</div>;

  const aiMeta = (jobResult?.generatedMetadataJson ?? doc.aiMetadataJson) as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <Link href="/documents"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <div><h1 className="text-2xl font-semibold">AI Metadata: {doc.title}</h1><p className="mt-1 text-sm text-muted-foreground">{doc.originalFileName} • {doc.documentType} • {doc.status}</p></div>
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">AI-generated metadata must be reviewed before publishing.</div>
      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 flex items-center gap-2"><Check className="h-4 w-4" />{success}</div>}

      <Card>
        <CardHeader><CardTitle>Generate AI Metadata</CardTitle><CardDescription>Extract text from PDF and generate SEO metadata, summary, keywords, and more.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerate} disabled={generateMutation.isPending}>{generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate Metadata</Button>
          {jobResult?.status === 'FAILED' && <p className="text-sm text-destructive">{jobResult.errorMessage}</p>}
        </CardContent>
      </Card>

      {aiMeta && (
        <Card>
          <CardHeader><CardTitle>AI-Generated Metadata</CardTitle><CardDescription>Review and apply to document.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(aiMeta).map(([key, value]) => (
              <div key={key} className="flex gap-3 text-sm border-b border-border pb-2 last:border-0">
                <span className="font-medium text-muted-foreground w-40 shrink-0">{key}</span>
                <span className="text-foreground">{Array.isArray(value) ? value.join(', ') : String(value || '-')}</span>
              </div>
            ))}
            {jobResult?.status === 'COMPLETED' && (
              <Button onClick={handleApply} disabled={applyMutation.isPending} className="mt-4">{applyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Apply AI Metadata</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function DocumentMetadataPage({ params }: { params: { id: string } }) {
  return <AdminPageShell sectionTitle="Document Metadata">{(user) => <MetadataContent user={user} docId={params.id} />}</AdminPageShell>;
}
