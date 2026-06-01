'use client';

import { useEffect, useState } from 'react';
import { Layout, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface MenuEntry { id: string; name: string; slug: string; location: string; status: string; languageCode: string | null; isDefault: boolean; updatedAt: string; _count: { items: number }; }

function MenusContent({ user }: { user: AuthUser }) {
  const [menus, setMenus] = useState<MenuEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newMenu, setNewMenu] = useState({ name: '', slug: '', location: 'HEADER' });
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);
  async function loadData() { try { setMenus(await apiClient<MenuEntry[]>('/api/menus')); } catch {} setLoading(false); }

  async function handleCreate() {
    if (!newMenu.name || !newMenu.slug) return;
    setCreating(true);
    try { await apiClient('/api/menus', { method: 'POST', body: JSON.stringify(newMenu) }); setSuccess('Menu created.'); setShowCreate(false); setNewMenu({ name: '', slug: '', location: 'HEADER' }); await loadData(); } catch {}
    setCreating(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const locationColors: Record<string, string> = { HEADER: 'bg-blue-100 text-blue-700', FOOTER: 'bg-emerald-100 text-emerald-700', SIDEBAR_MENU: 'bg-purple-100 text-purple-700', MOBILE: 'bg-amber-100 text-amber-700' };
  const statusColors: Record<string, string> = { MENU_ACTIVE: 'bg-emerald-100 text-emerald-700', MENU_DRAFT: 'bg-gray-100 text-gray-700', MENU_INACTIVE: 'bg-gray-100 text-gray-500' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Navigation / Menus</h1><p className="mt-1 text-sm text-muted-foreground">Manage header, footer, and sidebar navigation menus.</p></div>
        <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4" /> New Menu</Button>
      </div>

      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      {showCreate && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Menu</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={newMenu.name} onChange={(e) => setNewMenu(m => ({ ...m, name: e.target.value }))} placeholder="Main Header Menu" /></div>
              <div className="space-y-2"><Label>Slug *</Label><Input value={newMenu.slug} onChange={(e) => setNewMenu(m => ({ ...m, slug: e.target.value }))} placeholder="main-header" /></div>
              <div className="space-y-2"><Label>Location</Label><select className="w-full rounded-md border p-2 text-sm" value={newMenu.location} onChange={(e) => setNewMenu(m => ({ ...m, location: e.target.value }))}><option value="HEADER">Header</option><option value="FOOTER">Footer</option><option value="SIDEBAR_MENU">Sidebar</option><option value="MOBILE">Mobile</option><option value="UTILITY">Utility</option></select></div>
            </div>
            <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Menus ({menus.length})</CardTitle><CardDescription>Click a menu to manage its items.</CardDescription></CardHeader>
        <CardContent>
          {menus.length === 0 ? <p className="text-center py-8 text-muted-foreground">No menus yet. Create your first navigation menu.</p> : (
            <div className="space-y-2">
              {menus.map(m => (
                <Link key={m.id} href={`/menus/${m.id}`} className="block">
                  <div className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                    <Layout className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m.name} {m.isDefault && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1">Default</span>}</p>
                      <p className="text-xs text-muted-foreground">{m.slug} • {m._count.items} items</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${locationColors[m.location] || 'bg-gray-100'}`}>{m.location}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[m.status] || ''}`}>{m.status.replace('MENU_', '')}</span>
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

export default function MenusPage() {
  return <AdminPageShell sectionTitle="Navigation">{(user) => <MenusContent user={user} />}</AdminPageShell>;
}
