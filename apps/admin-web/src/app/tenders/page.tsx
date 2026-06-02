'use client';

import { useEffect, useState } from 'react';
import { FileText, Loader2, Plus } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface TenderEntry { id: string; title: string; slug: string; tenderNumber: string | null; departmentName: string | null; procurementType: string; status: string; closingDate: string | null; publishedAt: string | null; corrigendumCount: number; category: { name: string } | null; }

function TendersContent({ user }: { user: AuthUser }) {
  const [items, setItems] = useState<TenderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', slug: '', tenderNumber: '', departmentName: '', procurementType: 'GOODS', description: '', closingDate: '' });
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);
  async function loadData() { try { setItems(await apiClient<TenderEntry[]>('/api/tenders')); } catch {} setLoading(false); }

  async function handleCreate() {
    if (!newItem.title || !newItem.slug) return;
    setCreating(true);
    try { await apiClient('/api/tenders', { method: 'POST', body: JSON.stringify(newItem) }); setSuccess('Tender created.'); setShowCreate(false); await loadData(); } catch {}
    setCreating(false);
  }

  async function handlePublish(id: string) {
    try { await apiClient(`/api/tenders/${id}/publish`, { method: 'POST' }); await loadData(); } catch {}
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const statusColors: Record<string, string> = { TENDER_PUBLISHED: 'bg-emerald-100 text-emerald-700', TENDER_OPEN: 'bg-blue-100 text-blue-700', TENDER_DRAFT: 'bg-gray-100 text-gray-700', TENDER_CLOSED: 'bg-amber-100 text-amber-700', TENDER_ARCHIVED: 'bg-gray-100 text-gray-500' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Tenders & Procurement</h1><p className="mt-1 text-sm text-muted-foreground">Manage government/public procurement tenders.</p></div>
        <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4" /> New Tender</Button>
      </div>

      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      {showCreate && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Tender</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Title *</Label><Input value={newItem.title} onChange={(e) => setNewItem(n => ({ ...n, title: e.target.value }))} placeholder="Supply of IT Equipment" /></div>
              <div className="space-y-2"><Label>Slug *</Label><Input value={newItem.slug} onChange={(e) => setNewItem(n => ({ ...n, slug: e.target.value }))} placeholder="supply-it-equipment-2025" /></div>
              <div className="space-y-2"><Label>Tender Number</Label><Input value={newItem.tenderNumber} onChange={(e) => setNewItem(n => ({ ...n, tenderNumber: e.target.value }))} placeholder="TENDER/2025/001" /></div>
              <div className="space-y-2"><Label>Department</Label><Input value={newItem.departmentName} onChange={(e) => setNewItem(n => ({ ...n, departmentName: e.target.value }))} placeholder="IT Department" /></div>
              <div className="space-y-2"><Label>Type</Label><select className="w-full rounded-md border p-2 text-sm" value={newItem.procurementType} onChange={(e) => setNewItem(n => ({ ...n, procurementType: e.target.value }))}><option value="GOODS">Goods</option><option value="SERVICES">Services</option><option value="WORKS">Works</option><option value="CONSULTANCY">Consultancy</option><option value="IT_SOFTWARE">IT/Software</option><option value="MANPOWER">Manpower</option><option value="MAINTENANCE">Maintenance</option></select></div>
              <div className="space-y-2"><Label>Closing Date</Label><Input type="datetime-local" value={newItem.closingDate} onChange={(e) => setNewItem(n => ({ ...n, closingDate: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={newItem.description} onChange={(e) => setNewItem(n => ({ ...n, description: e.target.value }))} rows={3} /></div>
            <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Tenders ({items.length})</CardTitle></CardHeader>
        <CardContent>
          {items.length === 0 ? <p className="text-center py-8 text-muted-foreground">No tenders yet.</p> : (
            <div className="space-y-2">
              {items.map(t => (
                <div key={t.id} className="flex items-center gap-3 rounded-md border p-3">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.tenderNumber || '-'} • {t.departmentName || '-'} • {t.closingDate ? `Closes: ${new Date(t.closingDate).toLocaleDateString()}` : 'No closing date'}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{t.procurementType}</span>
                  {t.corrigendumCount > 0 && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{t.corrigendumCount} corr.</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[t.status] || ''}`}>{t.status.replace('TENDER_', '')}</span>
                  {t.status === 'TENDER_DRAFT' && <Button variant="outline" className="text-xs" onClick={() => handlePublish(t.id)}>Publish</Button>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TendersPage() {
  return <AdminPageShell sectionTitle="Tenders">{(user) => <TendersContent user={user} />}</AdminPageShell>;
}
