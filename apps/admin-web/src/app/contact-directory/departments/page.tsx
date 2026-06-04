'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, Trash2, Building2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';

interface Dept { id: string; name: string; slug: string; shortName: string | null; departmentType: string; parentId: string | null; status: string; sortOrder: number; }

function DepartmentsContent() {
  const [depts, setDepts] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', departmentType: 'DEPARTMENT' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => { setLoading(true); try { const data = await apiClient<Dept[]>('/contact-directory/departments'); setDepts(data || []); } catch {} setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    try { await apiClient('/contact-directory/departments', { method: 'POST', body: JSON.stringify({ ...form, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }) }); setForm({ name: '', slug: '', departmentType: 'DEPARTMENT' }); setShowForm(false); load(); } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; try { await apiClient(`/contact-directory/departments/${id}`, { method: 'DELETE' }); load(); } catch (e: any) { alert(e.message); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Departments</h1></div><Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Add Department</Button></div>
      {showForm && <Card><CardContent className="pt-4 space-y-3"><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><div><label className="text-sm font-medium">Name *</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div><div><label className="text-sm font-medium">Slug</label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} /></div><div><label className="text-sm font-medium">Type</label><select value={form.departmentType} onChange={e => setForm({...form, departmentType: e.target.value})} className="w-full rounded-lg border bg-background px-3 py-2 text-sm"><option value="DEPARTMENT">Department</option><option value="DIVISION">Division</option><option value="SECTION">Section</option><option value="UNIT">Unit</option><option value="OFFICE">Office</option><option value="CELL">Cell</option></select></div></div><div className="flex gap-2"><Button onClick={handleCreate} disabled={saving}>{saving?'Saving...':'Save'}</Button><Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button></div></CardContent></Card>}
      <Card><CardHeader><CardTitle>All Departments ({depts.length})</CardTitle></CardHeader><CardContent>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : depts.length === 0 ? <div className="text-center py-8"><Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">No departments yet.</p></div> : (
          <div className="divide-y">{depts.map(d => <div key={d.id} className="flex items-center justify-between py-3"><div><p className="font-medium text-sm">{d.name}{d.shortName ? ` (${d.shortName})` : ''}</p><p className="text-xs text-muted-foreground">{d.departmentType} · /{d.slug}</p></div><div className="flex items-center gap-2"><span className={`text-xs px-2 py-0.5 rounded-full ${d.status === 'DEPT_ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{d.status === 'DEPT_ACTIVE' ? 'Active' : 'Inactive'}</span><button onClick={() => handleDelete(d.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>
        )}
      </CardContent></Card>
    </div>
  );
}

export default function Page() { return <AdminPageShell sectionTitle="Departments">{() => <DepartmentsContent />}</AdminPageShell>; }
