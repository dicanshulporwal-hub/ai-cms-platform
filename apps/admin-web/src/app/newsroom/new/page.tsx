'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { apiClient } from '@/lib/api-client';

const ITEM_TYPES = [{ value: 'PRESS_RELEASE', label: 'Press Release' }, { value: 'MEDIA_COVERAGE', label: 'Media Coverage' }, { value: 'PHOTO_GALLERY_ITEM', label: 'Photo Gallery' }, { value: 'VIDEO', label: 'Video' }, { value: 'SPEECH', label: 'Speech' }, { value: 'NEWS_UPDATE', label: 'News Update' }];

export default function NewNewsroomPage() { return <AdminPageShell sectionTitle="Create Newsroom Item">{() => <Content />}</AdminPageShell>; }

function Content() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', itemType: 'PRESS_RELEASE', summary: '', content: '', eventDate: '', location: '', speakerName: '', sourceName: '', sourceUrl: '', videoUrl: '', featuredImageUrl: '', seoTitle: '', seoDescription: '' });

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.itemType) { alert('Title, slug, type required.'); return; }
    setSaving(true);
    try { const res: any = await apiClient('/newsroom', { method: 'POST', body: JSON.stringify({ ...form, eventDate: form.eventDate || undefined }) }); router.push(`/newsroom/${res.id}`); } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const ic = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3"><button onClick={() => router.push('/newsroom')} className="p-2 rounded-md hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button><h1 className="text-2xl font-bold">Create Newsroom Item</h1></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Title *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value, slug: form.slug || generateSlug(e.target.value)})} className={ic} required /></div>
            <div><label className="block text-sm font-medium mb-1">Slug *</label><input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className={ic} required /></div>
            <div><label className="block text-sm font-medium mb-1">Type *</label><select value={form.itemType} onChange={e => setForm({...form, itemType: e.target.value})} className={ic}>{ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Summary</label><textarea value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} rows={2} className={ic + ' resize-none'} /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Content</label><textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={6} className={ic + ' resize-none'} /></div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Event Date</label><input type="date" value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} className={ic} /></div>
            <div><label className="block text-sm font-medium mb-1">Location</label><input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className={ic} /></div>
            <div><label className="block text-sm font-medium mb-1">Speaker</label><input type="text" value={form.speakerName} onChange={e => setForm({...form, speakerName: e.target.value})} className={ic} /></div>
            <div><label className="block text-sm font-medium mb-1">Source Name</label><input type="text" value={form.sourceName} onChange={e => setForm({...form, sourceName: e.target.value})} className={ic} /></div>
            <div><label className="block text-sm font-medium mb-1">Source URL</label><input type="url" value={form.sourceUrl} onChange={e => setForm({...form, sourceUrl: e.target.value})} className={ic} /></div>
            <div><label className="block text-sm font-medium mb-1">Video URL</label><input type="url" value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} className={ic} /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Featured Image URL</label><input type="url" value={form.featuredImageUrl} onChange={e => setForm({...form, featuredImageUrl: e.target.value})} className={ic} /></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
          <button type="button" onClick={() => router.push('/newsroom')} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
        </div>
      </form>
    </div>
  );
}
