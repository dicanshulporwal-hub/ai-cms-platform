'use client';

import { FormEvent, useState } from 'react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function NewFormContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [formType, setFormType] = useState('CUSTOM');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(null);
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!slug.trim()) { setError('Slug is required.'); return; }
    setLoading(true);
    try {
      const form = await apiClient<any>('/api/forms', { method: 'POST', body: JSON.stringify({ title: title.trim(), slug: slug.trim(), description: description.trim() || undefined, formType }) });
      router.push(`/forms/${form.id}/builder`);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed.'); }
    setLoading(false);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Link href="/forms"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <div><h1 className="text-2xl font-semibold">Create Form</h1></div>
      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      <Card><CardHeader><CardTitle>Form Details</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Title *</Label><Input value={title} onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/g, '')); }} required /></div>
          <div className="space-y-2"><Label>Slug *</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} required /></div>
        </div>
        <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
        <div className="space-y-2"><Label>Form Type</Label><Select value={formType} onChange={(e) => setFormType(e.target.value)}><option value="CUSTOM">Custom</option><option value="CONTACT">Contact</option><option value="FEEDBACK">Feedback</option><option value="GRIEVANCE">Grievance</option><option value="SURVEY">Survey</option><option value="REGISTRATION">Registration</option><option value="APPLICATION">Application</option></Select></div>
      </CardContent></Card>
      <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Create & Open Builder</Button>
    </form>
  );
}

export default function NewFormPage() {
  return <AdminPageShell sectionTitle="Create Form">{(user) => <NewFormContent user={user} />}</AdminPageShell>;
}
