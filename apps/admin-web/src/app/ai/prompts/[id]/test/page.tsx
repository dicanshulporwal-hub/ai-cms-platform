'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Play } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface TestRun { id: string; success: boolean; outputText: string | null; tokenInput: number; tokenOutput: number; latencyMs: number; createdAt: string; }

function TestContent({ user, promptId }: { user: AuthUser; promptId: string }) {
  const [prompt, setPrompt] = useState<any>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestRun | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient<any>(`/api/ai-prompts/${promptId}`),
      apiClient<TestRun[]>(`/api/ai-prompts/${promptId}/test-runs`),
    ]).then(([p, runs]) => { setPrompt(p); setTestRuns(runs); }).finally(() => setLoading(false));
  }, [promptId]);

  async function handleTest() {
    setTesting(true); setResult(null);
    try {
      const run = await apiClient<TestRun>(`/api/ai-prompts/${promptId}/test`, { method: 'POST', body: JSON.stringify({ variables }) });
      setResult(run);
      setTestRuns(prev => [run, ...prev].slice(0, 20));
    } catch {}
    setTesting(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  // Extract variables from the latest version's template
  const latestVersion = prompt?.versions?.[0];
  const templateVars = latestVersion?.userPromptTemplate?.match(/\{\{(\w+)\}\}/g)?.map((v: string) => v.replace(/[{}]/g, '')) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/ai/prompts/${promptId}`}><Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
        <div><h1 className="text-2xl font-semibold">Test: {prompt?.name}</h1><p className="text-sm text-muted-foreground">Test this prompt with sample variables.</p></div>
      </div>

      {/* Variables Input */}
      <Card>
        <CardHeader><CardTitle className="text-base">Variables</CardTitle><CardDescription>Fill in the template variables to test the prompt.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {templateVars.length === 0 ? (
            <p className="text-sm text-muted-foreground">No variables detected in the prompt template.</p>
          ) : (
            templateVars.map((v: string) => (
              <div key={v} className="space-y-1">
                <Label className="font-mono text-xs">{`{{${v}}}`}</Label>
                <Input value={variables[v] || ''} onChange={(e) => setVariables(prev => ({ ...prev, [v]: e.target.value }))} placeholder={`Enter ${v}...`} />
              </div>
            ))
          )}
          <Button onClick={handleTest} disabled={testing} className="mt-4">
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run Test
          </Button>
        </CardContent>
      </Card>

      {/* Latest Result */}
      {result && (
        <Card className={result.success ? 'border-emerald-200' : 'border-red-200'}>
          <CardHeader><CardTitle className="text-base">{result.success ? '✓ Test Passed' : '✗ Test Failed'}</CardTitle></CardHeader>
          <CardContent>
            <pre className="rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap max-h-60 overflow-auto">{result.outputText}</pre>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span>Tokens in: {result.tokenInput}</span>
              <span>Tokens out: {result.tokenOutput}</span>
              <span>Latency: {result.latencyMs}ms</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Runs */}
      {testRuns.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Previous Test Runs ({testRuns.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testRuns.map(run => (
                <div key={run.id} className="flex items-center gap-3 rounded-md border p-2 text-xs">
                  <span className={run.success ? 'text-emerald-600' : 'text-destructive'}>{run.success ? '✓' : '✗'}</span>
                  <span className="flex-1 truncate font-mono">{run.outputText?.substring(0, 80) || '-'}</span>
                  <span className="text-muted-foreground">{run.latencyMs}ms</span>
                  <span className="text-muted-foreground">{new Date(run.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function PromptTestPage({ params }: { params: { id: string } }) {
  return <AdminPageShell sectionTitle="Prompt Test">{(user) => <TestContent user={user} promptId={params.id} />}</AdminPageShell>;
}
