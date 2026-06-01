'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Copy, Key, Loader2, Plus, Trash2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface Summary { total: number; active: number; revoked: number; logsToday: number; }
interface Client { id: string; name: string; clientKey: string; maskedKey: string; status: string; scopesJson: string[] | null; lastUsedAt: string | null; createdAt: string; }

function ApiAccessContent({ user }: { user: AuthUser }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', description: '', scopes: [] as string[] });
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [s, c] = await Promise.all([apiClient<Summary>('/api/api-access/summary'), apiClient<Client[]>('/api/api-access/clients')]);
      setSummary(s); setClients(c);
    } catch {}
    setLoading(false);
  }

  async function handleCreate() {
    if (!newClient.name) return;
    setCreating(true); setCreatedKey(null);
    try {
      const result = await apiClient<any>('/api/api-access/clients', { method: 'POST', body: JSON.stringify(newClient) });
      setCreatedKey(result.apiKey);
      setSuccess('API client created. Copy the key below — it will not be shown again.');
      setShowCreate(false);
      await loadData();
    } catch {}
    setCreating(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const SCOPES = ['pages.read', 'blogs.read', 'documents.read', 'faqs.read', 'forms.read', 'media.read', 'search.read'];
  const statusColors: Record<string, string> = { API_ACTIVE: 'bg-emerald-100 text-emerald-700', API_INACTIVE: 'bg-gray-100 text-gray-700', API_REVOKED: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">API Access / Headless CMS</h1><p className="mt-1 text-sm text-muted-foreground">Manage API keys for external content consumption.</p></div>
        <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4" /> New API Client</Button>
      </div>

      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      {/* Created Key Warning */}
      {createdKey && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-900">Copy your API key now — it will not be shown again!</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 rounded bg-white border px-3 py-2 text-sm font-mono break-all">{createdKey}</code>
                  <Button variant="outline" onClick={() => { navigator.clipboard.writeText(createdKey); }}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{summary?.total ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Total Clients</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-emerald-600">{summary?.active ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Active</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-destructive">{summary?.revoked ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Revoked</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{summary?.logsToday ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Requests Today</p></CardContent></Card>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create API Client</CardTitle><CardDescription>The API key will be shown only once after creation.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={newClient.name} onChange={(e) => setNewClient(c => ({ ...c, name: e.target.value }))} placeholder="Mobile App" /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={newClient.description} onChange={(e) => setNewClient(c => ({ ...c, description: e.target.value }))} placeholder="iOS/Android app" /></div>
            </div>
            <div className="space-y-2">
              <Label>Scopes</Label>
              <div className="flex flex-wrap gap-2">
                {SCOPES.map(scope => (
                  <button key={scope} type="button" onClick={() => setNewClient(c => ({ ...c, scopes: c.scopes.includes(scope) ? c.scopes.filter(s => s !== scope) : [...c.scopes, scope] }))} className={`text-xs px-2 py-1 rounded-full border ${newClient.scopes.includes(scope) ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>{scope}</button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />} Create & Generate Key</Button>
          </CardContent>
        </Card>
      )}

      {/* Clients List */}
      <Card>
        <CardHeader><CardTitle className="text-base">API Clients ({clients.length})</CardTitle></CardHeader>
        <CardContent>
          {clients.length === 0 ? <p className="text-center py-8 text-muted-foreground">No API clients. Create one to enable headless content access.</p> : (
            <div className="space-y-2">
              {clients.map(c => (
                <div key={c.id} className="flex items-center gap-3 rounded-md border p-3">
                  <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{c.maskedKey}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{(c.scopesJson || []).length} scopes</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[c.status] || ''}`}>{c.status.replace('API_', '')}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Example */}
      <Card>
        <CardHeader><CardTitle className="text-base">API Usage</CardTitle><CardDescription>Use your API key to access published content.</CardDescription></CardHeader>
        <CardContent>
          <pre className="rounded-md bg-muted p-4 text-xs font-mono overflow-auto">{`curl -H "Authorization: Bearer cms_live_YOUR_KEY" \\
  http://localhost:3001/api/v1/content/pages

# Response:
# { "success": true, "data": [...], "pagination": { "page": 1, "limit": 10, "total": 5 } }`}</pre>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ApiAccessPage() {
  return <AdminPageShell sectionTitle="API Access">{(user) => <ApiAccessContent user={user} />}</AdminPageShell>;
}
