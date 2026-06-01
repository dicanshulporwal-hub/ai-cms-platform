'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Loader2, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface Version { id: string; version: number; systemPrompt: string; userPromptTemplate: string; temperature: number; maxTokens: number; status: string; changeNote: string | null; createdAt: string; }
interface PromptDetail { id: string; promptKey: string; name: string; description: string | null; taskType: string; moduleKey: string | null; status: string; currentVersionId: string | null; isSystemPrompt: boolean; versions: Version[]; }

function PromptDetailContent({ user, promptId }: { user: AuthUser; promptId: string }) {
  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => { apiClient<PromptDetail>(`/api/ai-prompts/${promptId}`).then(setPrompt).finally(() => setLoading(false)); }, [promptId]);

  async function handleActivate(versionId: string) {
    setActivating(versionId);
    try {
      await apiClient(`/api/ai-prompts/${promptId}/versions/${versionId}/activate`, { method: 'POST', body: '{}' });
      const updated = await apiClient<PromptDetail>(`/api/ai-prompts/${promptId}`);
      setPrompt(updated);
    } catch {}
    setActivating(null);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!prompt) return <div className="text-destructive">Prompt not found.</div>;

  const statusColors: Record<string, string> = { VERSION_ACTIVE: 'bg-emerald-100 text-emerald-700', VERSION_DRAFT: 'bg-blue-100 text-blue-700', VERSION_PENDING: 'bg-amber-100 text-amber-700', VERSION_ARCHIVED: 'bg-gray-100 text-gray-500', VERSION_REJECTED: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/ai/prompts"><Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
        <div>
          <h1 className="text-2xl font-semibold">{prompt.name}</h1>
          <p className="text-sm text-muted-foreground">{prompt.promptKey} • {prompt.taskType.replace(/_/g, ' ')} {prompt.moduleKey ? `• ${prompt.moduleKey}` : ''}</p>
        </div>
      </div>

      {prompt.description && <p className="text-sm text-muted-foreground">{prompt.description}</p>}

      {/* Versions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Versions ({prompt.versions.length})</CardTitle><CardDescription>Manage prompt versions. Only one version can be active at a time.</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prompt.versions.map(v => (
              <div key={v.id} className={`rounded-md border p-4 ${v.id === prompt.currentVersionId ? 'border-emerald-300 bg-emerald-50/30' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold">v{v.version}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[v.status] || 'bg-gray-100'}`}>{v.status.replace('VERSION_', '')}</span>
                    {v.id === prompt.currentVersionId && <span className="text-xs text-emerald-600 font-medium">Current</span>}
                  </div>
                  <div className="flex gap-1">
                    {v.id !== prompt.currentVersionId && (
                      <Button variant="outline" className="text-xs" onClick={() => handleActivate(v.id)} disabled={activating === v.id}>
                        {activating === v.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Activate
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">System Prompt:</p>
                    <pre className="bg-muted rounded p-2 whitespace-pre-wrap max-h-24 overflow-auto font-mono">{v.systemPrompt.substring(0, 300)}{v.systemPrompt.length > 300 ? '...' : ''}</pre>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">User Prompt Template:</p>
                    <pre className="bg-muted rounded p-2 whitespace-pre-wrap max-h-24 overflow-auto font-mono">{v.userPromptTemplate.substring(0, 300)}{v.userPromptTemplate.length > 300 ? '...' : ''}</pre>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Temp: {v.temperature}</span>
                  <span>Max tokens: {v.maxTokens}</span>
                  <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                  {v.changeNote && <span>Note: {v.changeNote}</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PromptDetailPage({ params }: { params: { id: string } }) {
  return <AdminPageShell sectionTitle="Prompt Detail">{(user) => <PromptDetailContent user={user} promptId={params.id} />}</AdminPageShell>;
}
