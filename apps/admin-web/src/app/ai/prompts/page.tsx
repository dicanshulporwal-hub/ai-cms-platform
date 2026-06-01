'use client';

import { useEffect, useState } from 'react';
import { Code, Loader2, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface PromptTemplate { id: string; promptKey: string; name: string; taskType: string; moduleKey: string | null; status: string; isSystemPrompt: boolean; isDefault: boolean; updatedAt: string; }
interface Governance { total: number; active: number; pending: number; disabled: number; }

function PromptsContent({ user }: { user: AuthUser }) {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [governance, setGovernance] = useState<Governance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient<PromptTemplate[]>('/api/ai-prompts'),
      apiClient<Governance>('/api/ai-prompts/governance'),
    ]).then(([p, g]) => { setPrompts(p); setGovernance(g); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const statusColors: Record<string, string> = { PROMPT_ACTIVE: 'bg-emerald-100 text-emerald-700', PROMPT_DRAFT: 'bg-blue-100 text-blue-700', PENDING_APPROVAL: 'bg-amber-100 text-amber-700', PROMPT_DISABLED: 'bg-gray-100 text-gray-700', PROMPT_ARCHIVED: 'bg-gray-100 text-gray-500' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">AI Prompt Management</h1><p className="mt-1 text-sm text-muted-foreground">Manage, version, and govern AI prompts used across the CMS.</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => { await apiClient('/api/ai-prompts/seed', { method: 'POST' }); window.location.reload(); }}>Seed Defaults</Button>
          <Link href="/ai/prompts/new"><Button><Plus className="h-4 w-4" /> New Prompt</Button></Link>
        </div>
      </div>

      {/* Governance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{governance?.total ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Total Prompts</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-emerald-600">{governance?.active ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Active</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-amber-600">{governance?.pending ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Pending Approval</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-gray-500">{governance?.disabled ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Disabled</p></CardContent></Card>
      </div>

      {/* Prompt List */}
      <Card>
        <CardHeader><CardTitle className="text-base">Prompt Templates ({prompts.length})</CardTitle><CardDescription>Click a prompt to view versions, edit, or test.</CardDescription></CardHeader>
        <CardContent>
          {prompts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No prompts yet. Create your first AI prompt template.</p>
          ) : (
            <div className="space-y-2">
              {prompts.map(p => (
                <Link key={p.id} href={`/ai/prompts/${p.id}`} className="block">
                  <div className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                    <Code className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        {p.isSystemPrompt && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">System</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.promptKey} • {p.taskType.replace(/_/g, ' ')} {p.moduleKey ? `• ${p.moduleKey}` : ''}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[p.status] || 'bg-gray-100'}`}>{p.status.replace('PROMPT_', '')}</span>
                    <span className="text-xs text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PromptsPage() {
  return <AdminPageShell sectionTitle="AI Prompts">{(user) => <PromptsContent user={user} />}</AdminPageShell>;
}
