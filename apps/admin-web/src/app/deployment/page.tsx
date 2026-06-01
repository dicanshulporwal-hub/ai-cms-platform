'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, CheckCircle, Globe, Loader2, Play, Plus, Server } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface Summary { environments: number; defaultEnv: { id: string; name: string; status: string } | null; checklistItems: number; recentLogs: number; }
interface Environment { id: string; name: string; environmentKey: string; status: string; baseUrl: string | null; publicUrl: string | null; isDefault: boolean; }
interface ReadinessResult { score: number; passed: number; failed: number; warnings: number; total: number; checks: { key: string; title: string; category: string; severity: string; status: string; message: string }[]; }

function DeploymentContent({ user }: { user: AuthUser }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEnv, setNewEnv] = useState({ name: '', environmentKey: '', baseUrl: '', publicUrl: '', status: 'LOCAL' });
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [s, e] = await Promise.all([apiClient<Summary>('/api/deployment/summary'), apiClient<Environment[]>('/api/deployment/environments')]);
      setSummary(s); setEnvironments(e);
    } catch {}
    setLoading(false);
  }

  async function handleReadiness(envId: string) {
    setChecking(true);
    try { const r = await apiClient<ReadinessResult>(`/api/deployment/environments/${envId}/readiness`, { method: 'POST' }); setReadiness(r); } catch {}
    setChecking(false);
  }

  async function handleCreate() {
    if (!newEnv.name || !newEnv.environmentKey) return;
    setCreating(true);
    try { await apiClient('/api/deployment/environments', { method: 'POST', body: JSON.stringify(newEnv) }); setSuccess('Environment created.'); setShowCreate(false); await loadData(); } catch {}
    setCreating(false);
  }

  async function seedChecklist() {
    try { await apiClient('/api/deployment/checklist/seed', { method: 'POST' }); setSuccess('Checklist seeded.'); } catch {}
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const statusColors: Record<string, string> = { LOCAL: 'bg-gray-100 text-gray-700', DEVELOPMENT: 'bg-blue-100 text-blue-700', STAGING: 'bg-amber-100 text-amber-700', PRODUCTION: 'bg-emerald-100 text-emerald-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Deployment Manager</h1><p className="mt-1 text-sm text-muted-foreground">Manage environments, readiness checks, and deployment checklists.</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={seedChecklist}>Seed Checklist</Button>
          <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4" /> New Environment</Button>
        </div>
      </div>

      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{summary?.environments ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Environments</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{summary?.defaultEnv?.name ?? '-'}</p><p className="text-xs text-muted-foreground mt-1">Default Env</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{summary?.checklistItems ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Checklist Items</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{summary?.recentLogs ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Log Entries</p></CardContent></Card>
      </div>

      {/* Create Environment */}
      {showCreate && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Environment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={newEnv.name} onChange={(e) => setNewEnv(n => ({ ...n, name: e.target.value }))} placeholder="Production" /></div>
              <div className="space-y-2"><Label>Key *</Label><Input value={newEnv.environmentKey} onChange={(e) => setNewEnv(n => ({ ...n, environmentKey: e.target.value }))} placeholder="production" /></div>
              <div className="space-y-2"><Label>Status</Label><select className="w-full rounded-md border p-2 text-sm" value={newEnv.status} onChange={(e) => setNewEnv(n => ({ ...n, status: e.target.value }))}><option value="LOCAL">Local</option><option value="DEVELOPMENT">Development</option><option value="STAGING">Staging</option><option value="PRODUCTION">Production</option></select></div>
              <div className="space-y-2"><Label>Public URL</Label><Input value={newEnv.publicUrl} onChange={(e) => setNewEnv(n => ({ ...n, publicUrl: e.target.value }))} placeholder="https://yoursite.com" /></div>
              <div className="space-y-2"><Label>Base URL</Label><Input value={newEnv.baseUrl} onChange={(e) => setNewEnv(n => ({ ...n, baseUrl: e.target.value }))} placeholder="https://api.yoursite.com" /></div>
            </div>
            <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create</Button>
          </CardContent>
        </Card>
      )}

      {/* Environments */}
      <Card>
        <CardHeader><CardTitle className="text-base">Environments ({environments.length})</CardTitle></CardHeader>
        <CardContent>
          {environments.length === 0 ? <p className="text-center py-8 text-muted-foreground">No environments. Create one above.</p> : (
            <div className="space-y-2">
              {environments.map(env => (
                <div key={env.id} className="flex items-center gap-3 rounded-md border p-3">
                  <Server className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{env.name} {env.isDefault && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1">Default</span>}</p>
                    <p className="text-xs text-muted-foreground">{env.publicUrl || env.baseUrl || env.environmentKey}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[env.status] || ''}`}>{env.status}</span>
                  <Button variant="outline" className="text-xs" onClick={() => handleReadiness(env.id)} disabled={checking}><Play className="h-3 w-3" /> Check</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Readiness Result */}
      {readiness && (
        <Card className={readiness.score >= 80 ? 'border-emerald-200' : readiness.score >= 50 ? 'border-amber-200' : 'border-red-200'}>
          <CardHeader><CardTitle className="text-base">Readiness: {readiness.score}%</CardTitle><CardDescription>{readiness.passed} passed, {readiness.failed} failed, {readiness.warnings} warnings</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {readiness.checks.map(c => (
                <div key={c.key} className="flex items-center gap-2 text-sm">
                  {c.status === 'PASSED' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : c.status === 'WARNING' ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                  <span className="flex-1">{c.title}</span>
                  <span className="text-xs text-muted-foreground">{c.category}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${c.status === 'PASSED' ? 'bg-emerald-100 text-emerald-700' : c.status === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function DeploymentPage() {
  return <AdminPageShell sectionTitle="Deployment">{(user) => <DeploymentContent user={user} />}</AdminPageShell>;
}
