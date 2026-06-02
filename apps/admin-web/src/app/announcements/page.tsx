'use client';

import { useEffect, useState } from 'react';
import { Bell, Loader2, Plus } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface AnnEntry { id: string; title: string; slug: string; summary: string | null; announcementType: string; status: string; priority: string; isPinned: boolean; isImportant: boolean; publishedAt: string | null; category: { name: string } | null; }

function AnnouncementsContent({ user }: { user: AuthUser }) {
  const [items, setItems] = useState<AnnEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', slug: '', summary: '', content: '', announcementType: 'NOTICE' });
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);
  async function loadData() { try { setItems(await apiClient<AnnEntry[]>('/api/announcements')); } catch {} setLoading(false); }

  async function handleCreate() {
    if (!newItem.title || !newItem.slug) return;
    setCreating(true);
    try { await apiClient('/api/announcements', { method: 'POST', body: JSON.stringify(newItem) }); setSuccess('Created.'); setShowCreate(false); setNewItem({ title: '', slug: '', summary: '', content: '', announcementType: 'NOTICE' }); await loadData(); } catch {}
    setCreating(false);
  }

  async function handlePublish(id: string) {
    try { await apiClient(`/api/announcements/${id}/publish`, { method: 'POST' }); await loadData(); } catch {}
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const typeColors: Record<string, string> = { NOTICE: 'bg-blue-100 text-blue-700', CIRCULAR: 'bg-purple-100 text-purple-700', OFFICE_ORDER: 'bg-amber-100 text-amber-700', ANNOUNCEMENT: 'bg-emerald-100 text-emerald-700', ALERT: 'bg-red-100 text-red-700' };
  const statusColors: Record<string, string> = { ANN_PUBLISHED: 'bg-emerald-100 text-emerald-700', ANN_DRAFT: 'bg-gray-100 text-gray-700', ANN_ARCHIVED: 'bg-gray-100 text-gray-500', ANN_EXPIRED: 'bg-amber-100 text-amber-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Announcements & Notices</h1><p className="mt-1 text-sm text-muted-foreground">Manage notices, circulars, office orders, and public announcements.</p></div>
        <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4" /> New Announcement</Button>
      </div>

      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      {showCreate && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Announcement</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Title *</Label><Input value={newItem.title} onChange={(e) => setNewItem(n => ({ ...n, title: e.target.value }))} placeholder="Important Notice" /></div>
              <div className="space-y-2"><Label>Slug *</Label><Input value={newItem.slug} onChange={(e) => setNewItem(n => ({ ...n, slug: e.target.value }))} placeholder="important-notice-2025" /></div>
              <div className="space-y-2"><Label>Type</Label><select className="w-full rounded-md border p-2 text-sm" value={newItem.announcementType} onChange={(e) => setNewItem(n => ({ ...n, announcementType: e.target.value }))}><option value="NOTICE">Notice</option><option value="CIRCULAR">Circular</option><option value="OFFICE_ORDER">Office Order</option><option value="ANNOUNCEMENT">Announcement</option><option value="ALERT">Alert</option><option value="RECRUITMENT">Recruitment</option><option value="RESULT">Result</option></select></div>
            </div>
            <div className="space-y-2"><Label>Summary</Label><Input value={newItem.summary} onChange={(e) => setNewItem(n => ({ ...n, summary: e.target.value }))} placeholder="Brief summary..." /></div>
            <div className="space-y-2"><Label>Content</Label><Textarea value={newItem.content} onChange={(e) => setNewItem(n => ({ ...n, content: e.target.value }))} rows={4} placeholder="Full announcement content..." /></div>
            <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Announcements ({items.length})</CardTitle></CardHeader>
        <CardContent>
          {items.length === 0 ? <p className="text-center py-8 text-muted-foreground">No announcements yet.</p> : (
            <div className="space-y-2">
              {items.map(a => (
                <div key={a.id} className="flex items-center gap-3 rounded-md border p-3">
                  <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      {a.isPinned && <span className="text-xs bg-primary/10 text-primary px-1 rounded">📌</span>}
                      {a.isImportant && <span className="text-xs bg-red-100 text-red-700 px-1 rounded">❗</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{a.category?.name || '-'} • {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'Not published'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[a.announcementType] || 'bg-gray-100'}`}>{a.announcementType}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[a.status] || ''}`}>{a.status.replace('ANN_', '')}</span>
                  {a.status === 'ANN_DRAFT' && <Button variant="outline" className="text-xs" onClick={() => handlePublish(a.id)}>Publish</Button>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnnouncementsPage() {
  return <AdminPageShell sectionTitle="Announcements">{(user) => <AnnouncementsContent user={user} />}</AdminPageShell>;
}
