'use client';

import { useEffect, useState } from 'react';
import { Key, Loader2, Plus, Trash2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

interface ApiClient { id: string; name: string; clientId: string; scopes: string[]; isActive: boolean; lastUsedAt: string | null; createdAt: string; }

function ClientsContent() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try { const data: any = await apiClient('/api-access/clients'); setClients(data.data || data || []); } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this API client?')) return;
    try { await apiClient(`/api-access/clients/${id}`, { method: 'DELETE' }); setClients(c => c.filter(x => x.id !== id)); } catch (e: any) { alert(e.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">API Clients</h1><p className="text-sm text-muted-foreground mt-1">Manage API keys for headless CMS access</p></div>
        <Button onClick={() => alert('Use the API Access overview page to generate new keys.')}><Plus className="h-4 w-4 mr-2" />New Client</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Active Clients</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : clients.length === 0 ? (
            <div className="text-center py-8"><Key className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">No API clients configured.</p></div>
          ) : (
            <div className="divide-y">
              {clients.map((client) => (
                <div key={client.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">{client.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{client.clientId}</p>
                    <div className="flex gap-1 mt-1">{(client.scopes || []).map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{s}</span>)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${client.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{client.isActive ? 'Active' : 'Revoked'}</span>
                    <button onClick={() => handleRevoke(client.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ApiClientsPage() {
  return <AdminPageShell sectionTitle="API Clients">{() => <ClientsContent />}</AdminPageShell>;
}
