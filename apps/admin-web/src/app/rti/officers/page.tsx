'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, Trash2, Users } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';

interface RtiOfficer { id: string; name: string; designation: string | null; department: string | null; email: string | null; phone: string | null; officerType: string; isActive: boolean; }

function OfficersContent() {
  const [officers, setOfficers] = useState<RtiOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', designation: '', department: '', email: '', phone: '', officerType: 'PIO' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const data = await apiClient<RtiOfficer[]>('/rti/officers'); setOfficers(data || []); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.name.trim()) { alert('Name is required'); return; }
    setSaving(true);
    try {
      await apiClient('/rti/officers', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', designation: '', department: '', email: '', phone: '', officerType: 'PIO' });
      setShowForm(false); load();
    } catch (e: any) { alert(e.message || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this officer?')) return;
    try { await apiClient(`/rti/officers/${id}`, { method: 'DELETE' }); load(); } catch (e: any) { alert(e.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">RTI Officers</h1><p className="text-sm text-muted-foreground mt-1">Manage Public Information Officers and Appellate Authorities</p></div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Add Officer</Button>
      </div>
      {showForm && (
        <Card><CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Name *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Type</label><select value={form.officerType} onChange={(e) => setForm({ ...form, officerType: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm"><option value="PIO">Public Information Officer</option><option value="APPELLATE">First Appellate Authority</option><option value="TRANSPARENCY">Transparency Officer</option></select></div>
            <div><label className="text-sm font-medium">Designation</label><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Department</label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Phone</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCreate} disabled={saving}>{saving ? 'Saving...' : 'Save Officer'}</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </CardContent></Card>
      )}
      <Card>
        <CardHeader><CardTitle>Officers ({officers.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : officers.length === 0 ? (
            <div className="text-center py-8"><Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">No RTI officers configured.</p></div>
          ) : (
            <div className="divide-y">
              {officers.map((officer) => (
                <div key={officer.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">{officer.name}</p>
                    <p className="text-xs text-muted-foreground">{officer.designation}{officer.department && ` · ${officer.department}`}</p>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      {officer.email && <span>📧 {officer.email}</span>}
                      {officer.phone && <span>📞 {officer.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{officer.officerType}</span>
                    <button onClick={() => handleDelete(officer.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button>
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

export default function RtiOfficersPage() {
  return <AdminPageShell sectionTitle="RTI Officers">{() => <OfficersContent />}</AdminPageShell>;
}
