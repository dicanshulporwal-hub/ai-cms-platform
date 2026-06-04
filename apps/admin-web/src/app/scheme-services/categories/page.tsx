'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';

interface SSCategory { id: string; name: string; slug: string; description: string | null; status: string; sortOrder: number; }

function CategoriesContent() {
  const [categories, setCategories] = useState<SSCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const data = await apiClient<SSCategory[]>('/scheme-service-categories'); setCategories(data || []); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try { await apiClient('/scheme-service-categories', { method: 'POST', body: JSON.stringify({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }) }); setName(''); setShowForm(false); load(); } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await apiClient(`/scheme-service-categories/${id}`, { method: 'DELETE' }); load(); } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Scheme/Service Categories</h1></div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
      </div>
      {showForm && <Card><CardContent className="pt-4 flex gap-3 items-end"><div className="flex-1"><label className="text-sm font-medium">Name</label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Social Welfare" /></div><Button onClick={handleCreate} disabled={saving}>{saving?'Saving...':'Save'}</Button><Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button></CardContent></Card>}
      <Card><CardHeader><CardTitle>Categories ({categories.length})</CardTitle></CardHeader><CardContent>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : categories.length === 0 ? <p className="text-center py-4 text-sm text-muted-foreground">No categories.</p> : (
          <div className="divide-y">{categories.map(c => <div key={c.id} className="flex items-center justify-between py-3"><div><p className="font-medium text-sm">{c.name}</p><p className="text-xs text-muted-foreground">/{c.slug}</p></div><button onClick={() => handleDelete(c.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button></div>)}</div>
        )}
      </CardContent></Card>
    </div>
  );
}

export default function Page() { return <AdminPageShell sectionTitle="Categories">{() => <CategoriesContent />}</AdminPageShell>; }
