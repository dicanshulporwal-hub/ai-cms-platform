'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';

const LOCATIONS = ['HEADER', 'FOOTER', 'SIDEBAR', 'MOBILE'];

function NewMenuContent() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', slug: '', location: 'HEADER', description: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) { alert('Name and slug are required.'); return; }
    setSaving(true);
    try {
      const menu: any = await apiClient('/menus', { method: 'POST', body: JSON.stringify(form) });
      router.push('/menus');
    } catch (e: any) { alert(e.message || 'Failed to create menu'); }
    setSaving(false);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/menus')} className="p-2 rounded-md hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button>
        <h1 className="text-2xl font-bold">Create Menu</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Menu Name *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || generateSlug(e.target.value) })} placeholder="e.g. Main Navigation" required /></div>
            <div><label className="block text-sm font-medium mb-1">Slug *</label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium mb-1">Location</label><select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">{LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Description</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Menu'}</Button>
              <Button type="button" variant="ghost" onClick={() => router.push('/menus')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewMenuPage() {
  return <AdminPageShell sectionTitle="Create Menu">{() => <NewMenuContent />}</AdminPageShell>;
}
