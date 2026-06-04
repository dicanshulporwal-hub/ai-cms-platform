'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';

interface TenderCategory { id: string; name: string; slug: string; description: string | null; status: string; }

function CategoriesContent() {
  const [categories, setCategories] = useState<TenderCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const data: any = await apiClient('/tenders/categories'); setCategories(data.data || data || []); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await apiClient('/tenders/categories', { method: 'POST', body: JSON.stringify({ name, slug }) });
      setName(''); setShowForm(false); load();
    } catch (e: any) { alert(e.message || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await apiClient(`/tenders/categories/${id}`, { method: 'DELETE' }); load(); } catch (e: any) { alert(e.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Tender Categories</h1><p className="text-sm text-muted-foreground mt-1">Manage tender procurement categories</p></div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
      </div>
      {showForm && (
        <Card><CardContent className="pt-4 flex gap-3 items-end">
          <div className="flex-1"><label className="text-sm font-medium">Category Name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. IT Services" /></div>
          <Button onClick={handleCreate} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
        </CardContent></Card>
      )}
      <Card>
        <CardHeader><CardTitle>Categories ({categories.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : categories.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No categories yet.</p> : (
            <div className="divide-y">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between py-3">
                  <div><p className="font-medium text-sm">{cat.name}</p><p className="text-xs text-muted-foreground">/{cat.slug}</p></div>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TenderCategoriesPage() {
  return <AdminPageShell sectionTitle="Tender Categories">{() => <CategoriesContent />}</AdminPageShell>;
}
