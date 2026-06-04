'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, Trash2, Award } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';

interface Desig { id: string; name: string; slug: string; level: number | null; sortOrder: number; status: string; }

function DesignationsContent() {
  const [items, setItems] = useState<Desig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => { setLoading(true); try { const data = await apiClient<Desig[]>('/contact-directory/designations'); setItems(data || []); } catch {} setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!name.trim()) return; setSaving(true);
    try { await apiClient('/contact-directory/designations', { method: 'POST', body: JSON.stringify({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }) }); setName(''); setShowForm(false); load(); } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; try { await apiClient(`/contact-directory/designations/${id}`, { method: 'DELETE' }); load(); } catch (e: any) { alert(e.message); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Designations</h1></div><Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Add Designation</Button></div>
      {showForm && <Card><CardContent className="pt-4 flex gap-3 items-end"><div className="flex-1"><label className="text-sm font-medium">Name</label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Joint Secretary" /></div><Button onClick={handleCreate} disabled={saving}>{saving?'Saving...':'Save'}</Button><Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button></CardContent></Card>}
      <Card><CardHeader><CardTitle>Designations ({items.length})</CardTitle></CardHeader><CardContent>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : items.length === 0 ? <div className="text-center py-8"><Award className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">No designations.</p></div> : (
          <div className="divide-y">{items.map(d => <div key={d.id} className="flex items-center justify-between py-3"><div><p className="font-medium text-sm">{d.name}</p><p className="text-xs text-muted-foreground">/{d.slug}{d.level !== null ? ` · Level ${d.level}` : ''}</p></div><button onClick={() => handleDelete(d.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button></div>)}</div>
        )}
      </CardContent></Card>
    </div>
  );
}

export default function Page() { return <AdminPageShell sectionTitle="Designations">{() => <DesignationsContent />}</AdminPageShell>; }
