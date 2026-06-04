'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, Search, Users } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';

interface Officer { id: string; fullName: string; slug: string; publicEmail: string | null; publicPhone: string | null; isPublic: boolean; status: string; displayOrder: number; designation: { name: string } | null; department: { name: string } | null; }

function OfficersContent() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', slug: '', publicEmail: '', publicPhone: '', isPublic: true });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const params = new URLSearchParams(); params.set('page', String(page)); params.set('limit', '10'); if (search) params.set('search', search); const data: any = await apiClient(`/contact-directory/officers?${params}`); setOfficers(data.data || []); setTotalPages(data.meta?.totalPages || 1); } catch {}
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.fullName) return; setSaving(true);
    try { await apiClient('/contact-directory/officers', { method: 'POST', body: JSON.stringify({ ...form, slug: form.slug || form.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-') }) }); setForm({ fullName: '', slug: '', publicEmail: '', publicPhone: '', isPublic: true }); setShowForm(false); load(); } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Officers</h1></div><Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Add Officer</Button></div>
      {showForm && <Card><CardContent className="pt-4 space-y-3"><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div><label className="text-sm font-medium">Full Name *</label><Input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} /></div><div><label className="text-sm font-medium">Slug</label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} /></div><div><label className="text-sm font-medium">Email</label><Input value={form.publicEmail} onChange={e => setForm({...form, publicEmail: e.target.value})} /></div><div><label className="text-sm font-medium">Phone</label><Input value={form.publicPhone} onChange={e => setForm({...form, publicPhone: e.target.value})} /></div></div><div className="flex items-center gap-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublic} onChange={e => setForm({...form, isPublic: e.target.checked})} />Public</label></div><div className="flex gap-2"><Button onClick={handleCreate} disabled={saving}>{saving?'Saving...':'Save'}</Button><Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button></div></CardContent></Card>}
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-10" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search officers..." /></div>
      <Card><CardHeader><CardTitle>Officers</CardTitle></CardHeader><CardContent>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : officers.length === 0 ? <div className="text-center py-8"><Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">No officers found.</p></div> : (
          <div className="divide-y">{officers.map(o => <div key={o.id} className="flex items-center justify-between py-3"><div><p className="font-medium text-sm">{o.fullName}</p><p className="text-xs text-muted-foreground">{o.designation?.name || 'No designation'}{o.department ? ` · ${o.department.name}` : ''}</p></div><div className="flex items-center gap-2"><span className={`text-xs px-2 py-0.5 rounded-full ${o.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{o.isPublic ? 'Public' : 'Private'}</span><span className={`text-xs px-2 py-0.5 rounded-full ${o.status === 'OFFICER_ACTIVE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{o.status.replace('OFFICER_', '')}</span></div></div>)}</div>
        )}
      </CardContent></Card>
      {totalPages > 1 && <div className="flex justify-center gap-2"><button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 text-sm rounded-md border disabled:opacity-50">Prev</button><span className="text-sm text-muted-foreground">Page {page}/{totalPages}</span><button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1 text-sm rounded-md border disabled:opacity-50">Next</button></div>}
    </div>
  );
}

export default function Page() { return <AdminPageShell sectionTitle="Officers">{() => <OfficersContent />}</AdminPageShell>; }
