'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';

function NewRtiContent() {
  const router = useRouter();
  const [form, setForm] = useState({ applicantName: '', applicantEmail: '', applicantPhone: '', applicantAddress: '', subject: '', description: '', department: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.applicantName || !form.subject || !form.description) { alert('Name, subject, and description are required.'); return; }
    setSaving(true);
    try {
      await apiClient('/rti/requests', { method: 'POST', body: JSON.stringify(form) });
      router.push('/rti');
    } catch (e: any) { alert(e.message || 'Failed to create RTI request'); }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/rti')} className="p-2 rounded-md hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button>
        <h1 className="text-2xl font-bold">New RTI Request</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Applicant Name *</label><Input value={form.applicantName} onChange={(e) => setForm({ ...form, applicantName: e.target.value })} required /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><Input type="email" value={form.applicantEmail} onChange={(e) => setForm({ ...form, applicantEmail: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Phone</label><Input value={form.applicantPhone} onChange={(e) => setForm({ ...form, applicantPhone: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Department</label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Address</label><Textarea value={form.applicantAddress} onChange={(e) => setForm({ ...form, applicantAddress: e.target.value })} rows={2} /></div>
            <div><label className="block text-sm font-medium mb-1">Subject *</label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium mb-1">Information Sought *</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} required /></div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Request'}</Button>
              <Button type="button" variant="ghost" onClick={() => router.push('/rti')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewRtiPage() {
  return <AdminPageShell sectionTitle="New RTI Request">{() => <NewRtiContent />}</AdminPageShell>;
}
