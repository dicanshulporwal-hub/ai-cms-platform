'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, ExternalLink, Loader2, Play, Plus, Send, Trash2, Webhook } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface Summary { total: number; enabled: number; failed: number; delivered: number; }
interface Endpoint { id: string; name: string; url: string; isEnabled: boolean; subscribedEventsJson: string[] | null; updatedAt: string; }
interface Delivery { id: string; eventType: string; status: string; attemptCount: number; lastStatusCode: number | null; lastErrorMessage: string | null; deliveredAt: string | null; createdAt: string; endpoint: { name: string }; }

const EVENT_TYPES = ['PAGE_PUBLISHED', 'BLOG_PUBLISHED', 'DOCUMENT_PUBLISHED', 'FORM_SUBMITTED', 'FAQ_PUBLISHED', 'WORKFLOW_PUBLISHED', 'CHATBOT_LEAD_CAPTURED', 'TEMPLATE_ACTIVATED', 'BACKUP_COMPLETED', 'USER_CREATED'];

function IntegrationsContent({ user }: { user: AuthUser }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newHook, setNewHook] = useState({ name: '', url: '', secret: '', subscribedEvents: [] as string[] });
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [s, e, d] = await Promise.all([
        apiClient<Summary>('/api/integrations/summary'),
        apiClient<Endpoint[]>('/api/webhooks'),
        apiClient<Delivery[]>('/api/webhooks/deliveries'),
      ]);
      setSummary(s); setEndpoints(e); setDeliveries(d);
    } catch {}
    setLoading(false);
  }

  async function handleCreate() {
    if (!newHook.name || !newHook.url) return;
    setCreating(true); setSuccess(null);
    try {
      await apiClient('/api/webhooks', { method: 'POST', body: JSON.stringify(newHook) });
      setSuccess('Webhook created.'); setShowCreate(false); setNewHook({ name: '', url: '', secret: '', subscribedEvents: [] });
      await loadData();
    } catch {}
    setCreating(false);
  }

  async function handleTest(id: string) {
    try { await apiClient(`/api/webhooks/${id}/test`, { method: 'POST' }); setSuccess('Test webhook sent.'); setTimeout(loadData, 2000); } catch {}
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this webhook?')) return;
    try { await apiClient(`/api/webhooks/${id}`, { method: 'DELETE' }); await loadData(); } catch {}
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const statusColors: Record<string, string> = { WEBHOOK_DELIVERED: 'bg-emerald-100 text-emerald-700', WEBHOOK_FAILED: 'bg-red-100 text-red-700', WEBHOOK_PENDING: 'bg-blue-100 text-blue-700', WEBHOOK_RETRY_SCHEDULED: 'bg-amber-100 text-amber-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Webhooks & Integrations</h1><p className="mt-1 text-sm text-muted-foreground">Send events to external services when CMS actions happen.</p></div>
        <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4" /> New Webhook</Button>
      </div>

      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{summary?.total ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Endpoints</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-emerald-600">{summary?.enabled ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Enabled</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-emerald-600">{summary?.delivered ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Delivered</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-destructive">{summary?.failed ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Failed</p></CardContent></Card>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Webhook</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={newHook.name} onChange={(e) => setNewHook(h => ({ ...h, name: e.target.value }))} placeholder="My Slack Webhook" /></div>
              <div className="space-y-2"><Label>URL *</Label><Input value={newHook.url} onChange={(e) => setNewHook(h => ({ ...h, url: e.target.value }))} placeholder="https://hooks.slack.com/..." /></div>
              <div className="space-y-2"><Label>Secret (optional)</Label><Input value={newHook.secret} onChange={(e) => setNewHook(h => ({ ...h, secret: e.target.value }))} placeholder="webhook-signing-secret" type="password" /></div>
            </div>
            <div className="space-y-2">
              <Label>Subscribe to Events</Label>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map(evt => (
                  <button key={evt} type="button" onClick={() => setNewHook(h => ({ ...h, subscribedEvents: h.subscribedEvents.includes(evt) ? h.subscribedEvents.filter(e => e !== evt) : [...h.subscribedEvents, evt] }))} className={`text-xs px-2 py-1 rounded-full border ${newHook.subscribedEvents.includes(evt) ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>{evt.replace(/_/g, ' ')}</button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Create</Button>
          </CardContent>
        </Card>
      )}

      {/* Endpoints */}
      <Card>
        <CardHeader><CardTitle className="text-base">Webhook Endpoints ({endpoints.length})</CardTitle></CardHeader>
        <CardContent>
          {endpoints.length === 0 ? <p className="text-center py-8 text-muted-foreground">No webhooks configured.</p> : (
            <div className="space-y-2">
              {endpoints.map(ep => (
                <div key={ep.id} className="flex items-center gap-3 rounded-md border p-3">
                  <Webhook className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{ep.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{ep.url.substring(0, 60)}...</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ep.isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{ep.isEnabled ? 'Enabled' : 'Disabled'}</span>
                  <Button variant="ghost" className="text-xs" onClick={() => handleTest(ep.id)}><Play className="h-3 w-3" /> Test</Button>
                  <Button variant="ghost" className="text-xs text-destructive" onClick={() => handleDelete(ep.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Deliveries ({deliveries.length})</CardTitle></CardHeader>
        <CardContent>
          {deliveries.length === 0 ? <p className="text-center py-8 text-muted-foreground">No deliveries yet.</p> : (
            <div className="space-y-2">
              {deliveries.slice(0, 15).map(d => (
                <div key={d.id} className="flex items-center gap-3 rounded-md border p-2 text-xs">
                  {d.status === 'WEBHOOK_DELIVERED' ? <Check className="h-3 w-3 text-emerald-600" /> : <AlertTriangle className="h-3 w-3 text-amber-500" />}
                  <span className="font-medium">{d.endpoint.name}</span>
                  <span className="text-muted-foreground">{d.eventType}</span>
                  <span className={`px-1.5 py-0.5 rounded ${statusColors[d.status] || ''}`}>{d.status.replace('WEBHOOK_', '')}</span>
                  {d.lastStatusCode && <span className="text-muted-foreground">HTTP {d.lastStatusCode}</span>}
                  <span className="ml-auto text-muted-foreground">{new Date(d.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function IntegrationsPage() {
  return <AdminPageShell sectionTitle="Integrations">{(user) => <IntegrationsContent user={user} />}</AdminPageShell>;
}
