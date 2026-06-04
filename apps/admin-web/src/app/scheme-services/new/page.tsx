'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { apiClient } from '@/lib/api-client';

export default function NewSchemeServicePage() {
  return <AdminPageShell sectionTitle="Create Scheme/Service">{() => <Content />}</AdminPageShell>;
}

function Content() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{id:string;name:string}[]>([]);
  const [departments, setDepartments] = useState<{id:string;name:string}[]>([]);
  const [form, setForm] = useState({ title: '', slug: '', type: 'SCHEME', summary: '', description: '', categoryId: '', departmentId: '', targetAudience: '', eligibilityCriteria: '', benefits: '', applicationProcess: '', timeline: '', applicationMode: 'NOT_APPLICABLE', applicationUrl: '', contactName: '', contactEmail: '', contactPhone: '', seoTitle: '', seoDescription: '' });

  useEffect(() => {
    apiClient('/scheme-service-categories').then((d: any) => setCategories(d || [])).catch(() => {});
    apiClient('/departments').then((d: any) => setDepartments(d || [])).catch(() => {});
  }, []);

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  const handleTitleChange = (t: string) => setForm(f => ({ ...f, title: t, slug: f.slug || generateSlug(t) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.type) { alert('Title, slug, type required.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, categoryId: form.categoryId || undefined, departmentId: form.departmentId || undefined };
      const res: any = await apiClient('/scheme-services', { method: 'POST', body: JSON.stringify(payload) });
      router.push(`/scheme-services/${res.id}`);
    } catch (e: any) { alert(e.message || 'Failed'); }
    setSaving(false);
  };

  const ic = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/scheme-services')} className="p-2 rounded-md hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button>
        <h1 className="text-2xl font-bold">Create Scheme / Service</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Title *</label><input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)} className={ic} required /></div>
            <div><label className="block text-sm font-medium mb-1">Slug *</label><input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className={ic} required /></div>
            <div><label className="block text-sm font-medium mb-1">Type *</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={ic}><option value="SCHEME">Scheme</option><option value="SERVICE">Service</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Category</label><select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className={ic}><option value="">None</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Department</label><select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} className={ic}><option value="">None</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Summary</label><textarea value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} rows={2} className={ic + ' resize-none'} /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={5} className={ic + ' resize-none'} /></div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Details</h2>
          <div><label className="block text-sm font-medium mb-1">Target Audience</label><input type="text" value={form.targetAudience} onChange={e => setForm({...form, targetAudience: e.target.value})} className={ic} placeholder="e.g. Citizens below poverty line" /></div>
          <div><label className="block text-sm font-medium mb-1">Eligibility Criteria</label><textarea value={form.eligibilityCriteria} onChange={e => setForm({...form, eligibilityCriteria: e.target.value})} rows={3} className={ic + ' resize-none'} /></div>
          <div><label className="block text-sm font-medium mb-1">Benefits</label><textarea value={form.benefits} onChange={e => setForm({...form, benefits: e.target.value})} rows={3} className={ic + ' resize-none'} /></div>
          <div><label className="block text-sm font-medium mb-1">Application Process</label><textarea value={form.applicationProcess} onChange={e => setForm({...form, applicationProcess: e.target.value})} rows={3} className={ic + ' resize-none'} /></div>
          <div><label className="block text-sm font-medium mb-1">Timeline</label><input type="text" value={form.timeline} onChange={e => setForm({...form, timeline: e.target.value})} className={ic} placeholder="e.g. 30 days from application" /></div>
        </div>
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Application</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Application Mode</label><select value={form.applicationMode} onChange={e => setForm({...form, applicationMode: e.target.value})} className={ic}><option value="NOT_APPLICABLE">Not Applicable</option><option value="ONLINE">Online</option><option value="OFFLINE">Offline</option><option value="BOTH">Both</option><option value="EXTERNAL_PORTAL">External Portal</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Application URL</label><input type="url" value={form.applicationUrl} onChange={e => setForm({...form, applicationUrl: e.target.value})} className={ic} /></div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} className={ic} /></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} className={ic} /></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} className={ic} /></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
          <button type="button" onClick={() => router.push('/scheme-services')} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
        </div>
      </form>
    </div>
  );
}
