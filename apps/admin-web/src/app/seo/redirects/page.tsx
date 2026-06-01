'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Link2, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface Summary { active: number; inactive: number; total404: number; open404: number; }
interface Rule { id: string; sourcePath: string; targetUrl: string; redirectType: string; status: string; matchType: string; hitCount: number; createdAt: string; }

function RedirectsContent({ user }: { user: AuthUser }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRule, setNewRule] = useState({ sourcePath: '', targetUrl: '', redirectType: 'MOVED_PERMANENTLY_301', matchType: 'EXACT' });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try { const [s, r] = await Promise.all([apiClient<Summary>('/api/redirects/summary'), apiClient<Rule[]>('/api/redirects')]); setSummary(s); setRules(r); } catch {}
    setLoading(false);
  }

  async function handleCreate() {
    if (!newRule.sourcePath || !newRule.targetUrl) return;
    setCreating(true); setError(null); setSuccess(null);
    try { await apiClient('/api/redirects', { method: 'POST', body: JSON.stringify(newRule) }); setSuccess('Redirect created.'); setShowCreate(false); setNewRule({ sourcePath: '', targetUrl: '', redirectType: 'MOVED_PERMANENTLY_301', matchType: 'EXACT' }); await loadData(); } catch (e) { setError(e instanceof Error ? e.message : 'Failed.'); }
    setCreating(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Redirect Manager</h1><p className="mt-1 text-sm text-muted-foreground">Manage URL redirects and track 404 errors.</p></div>
        <div className="flex gap-2">
          <Link href="/seo/redirects/404"><Button variant="outline">404 Logs ({summary?.open404 ?? 0})</Button></Link>
          <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4" /> New Redirect</Button>
        </div>
      </div>

      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}
      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-emerald-600">{summary?.active ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Active Redirects</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{summary?.inactive ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Inactive</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-amber-600">{summary?.open404 ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Open 404s</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{summary?.total404 ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Total 404s</p></CardContent></Card>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Redirect</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Source Path *</Label><Input value={newRule.sourcePath} onChange={(e) => setNewRule(r => ({ ...r, sourcePath: e.target.value }))} placeholder="/old-page" /></div>
              <div className="space-y-2"><Label>Target URL *</Label><Input value={newRule.targetUrl} onChange={(e) => setNewRule(r => ({ ...r, targetUrl: e.target.value }))} placeholder="/new-page" /></div>
              <div className="space-y-2"><Label>Type</Label><select className="w-full rounded-md border p-2 text-sm" value={newRule.redirectType} onChange={(e) => setNewRule(r => ({ ...r, redirectType: e.target.value }))}><option value="MOVED_PERMANENTLY_301">301 Permanent</option><option value="FOUND_302">302 Temporary</option><option value="TEMPORARY_REDIRECT_307">307 Temporary</option><option value="PERMANENT_REDIRECT_308">308 Permanent</option></select></div>
              <div className="space-y-2"><Label>Match</Label><select className="w-full rounded-md border p-2 text-sm" value={newRule.matchType} onChange={(e) => setNewRule(r => ({ ...r, matchType: e.target.value }))}><option value="EXACT">Exact</option><option value="PREFIX">Prefix</option></select></div>
            </div>
            <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Redirect Rules ({rules.length})</CardTitle></CardHeader>
        <CardContent>
          {rules.length === 0 ? <p className="text-center py-8 text-muted-foreground">No redirects configured.</p> : (
            <div className="space-y-2">
              {rules.map(r => (
                <div key={r.id} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                  <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{r.sourcePath}</code>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded flex-1 truncate">{r.targetUrl}</code>
                  <span className="text-xs text-muted-foreground">{r.redirectType.replace(/_/g, ' ').replace('MOVED PERMANENTLY ', '')}</span>
                  <span className="text-xs text-muted-foreground">{r.hitCount} hits</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${r.status === 'REDIRECT_ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{r.status.replace('REDIRECT_', '')}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RedirectsPage() {
  return <AdminPageShell sectionTitle="Redirects">{(user) => <RedirectsContent user={user} />}</AdminPageShell>;
}
