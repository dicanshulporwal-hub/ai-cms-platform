'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

const FIELD_TYPES = ['TEXT', 'TEXTAREA', 'EMAIL', 'PHONE', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX', 'FILE_UPLOAD', 'CONSENT', 'HIDDEN'];

function BuilderContent({ user, formId }: { user: AuthUser; formId: string }) {
  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('TEXT');
  const [newRequired, setNewRequired] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { load(); }, [formId]);
  async function load() { setLoading(true); try { const f = await apiClient<any>(`/api/forms/${formId}`); setForm(f); setFields(f.fields ?? []); } catch {} setLoading(false); }

  async function addField() {
    if (!newLabel.trim()) return;
    const fieldKey = newLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    try {
      await apiClient(`/api/forms/${formId}/fields`, { method: 'POST', body: JSON.stringify({ fieldKey, label: newLabel.trim(), fieldType: newType, isRequired: newRequired, sortOrder: fields.length }) });
      setNewLabel(''); setNewType('TEXT'); setNewRequired(false); setAdding(false); await load(); setSuccess('Field added.');
    } catch {}
  }

  async function deleteField(fieldId: string) {
    if (!confirm('Delete this field?')) return;
    try { await apiClient(`/api/forms/${formId}/fields/${fieldId}`, { method: 'DELETE' }); await load(); } catch {}
  }

  async function publishForm() {
    try { await apiClient(`/api/forms/${formId}/publish`, { method: 'POST' }); await load(); setSuccess('Form published!'); } catch {}
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!form) return <div className="text-destructive">Form not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><Link href="/forms"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link></div>
        <div className="flex gap-2">
          {form.status !== 'PUBLISHED' && <Button onClick={publishForm}>Publish Form</Button>}
          {form.status === 'PUBLISHED' && <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium">Published</span>}
        </div>
      </div>
      <div><h1 className="text-2xl font-semibold">Form Builder: {form.title}</h1><p className="mt-1 text-sm text-muted-foreground">Slug: {form.slug} • Type: {form.formType} • {fields.length} fields</p></div>
      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fields</CardTitle>
          <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="h-4 w-4" /> Add Field</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {adding && (
            <div className="rounded-md border bg-muted/30 p-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="space-y-1"><Label className="text-xs">Label</Label><Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Field label" /></div>
                <div className="space-y-1"><Label className="text-xs">Type</Label><Select value={newType} onChange={(e) => setNewType(e.target.value)}>{FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</Select></div>
                <div className="space-y-1 flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newRequired} onChange={(e) => setNewRequired(e.target.checked)} /> Required</label></div>
                <div className="flex items-end"><Button size="sm" onClick={addField}>Add</Button></div>
              </div>
            </div>
          )}
          {fields.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No fields yet. Add fields to build your form.</p> :
            fields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-3 rounded-md border p-3">
                <div className="text-xs text-muted-foreground w-6">{idx + 1}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{field.label} {field.isRequired && <span className="text-destructive">*</span>}</p>
                  <p className="text-xs text-muted-foreground">{field.fieldType} • key: {field.fieldKey}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteField(field.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))
          }
        </CardContent>
      </Card>
    </div>
  );
}

export default function FormBuilderPage({ params }: { params: { id: string } }) {
  return <AdminPageShell sectionTitle="Form Builder">{(user) => <BuilderContent user={user} formId={params.id} />}</AdminPageShell>;
}
