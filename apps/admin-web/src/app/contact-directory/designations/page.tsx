'use client';

import { useCallback, useEffect, useState } from 'react';
import { Award, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';

interface Desig {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: number | null;
  sortOrder: number;
  status: string;
}

const emptyForm = {
  description: '',
  level: '',
  name: '',
  slug: '',
  status: 'DESIG_ACTIVE',
};

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function DesignationsContent() {
  const [items, setItems] = useState<Desig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await apiClient<Desig[]>('/api/contact-directory/designations');
      setItems(data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (designation: Desig) => {
    setEditingId(designation.id);
    setForm({
      description: designation.description ?? '',
      level: designation.level === null ? '' : String(designation.level),
      name: designation.name,
      slug: designation.slug,
      status: designation.status ?? 'DESIG_ACTIVE',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      return;
    }

    setSaving(true);

    const payload = {
      description: form.description.trim() || null,
      level: form.level === '' ? null : Number(form.level),
      name: form.name.trim(),
      slug: form.slug.trim() || toSlug(form.name),
      status: form.status,
    };

    try {
      if (editingId) {
        await apiClient(`/api/contact-directory/designations/${editingId}`, {
          body: JSON.stringify(payload),
          method: 'PUT',
        });
      } else {
        await apiClient('/api/contact-directory/designations', {
          body: JSON.stringify(payload),
          method: 'POST',
        });
      }

      resetForm();
      load();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this designation?')) {
      return;
    }

    try {
      await apiClient(`/api/contact-directory/designations/${id}`, {
        method: 'DELETE',
      });
      load();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Designations</h1>
        </div>
        <Button onClick={startCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Designation
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Designation' : 'Add Designation'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  placeholder="e.g. Joint Secretary"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input
                  placeholder={form.name ? toSlug(form.name) : ''}
                  value={form.slug}
                  onChange={(event) => setForm({ ...form, slug: event.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Level</label>
                <Input
                  type="number"
                  value={form.level}
                  onChange={(event) => setForm({ ...form, level: event.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                >
                  <option value="DESIG_ACTIVE">Active</option>
                  <option value="DESIG_INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Designations ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center">
              <Award className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No designations.</p>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((designation) => (
                <div
                  key={designation.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{designation.name}</p>
                    <p className="text-xs text-muted-foreground">
                      /{designation.slug}
                      {designation.level !== null ? ` - Level ${designation.level}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                      onClick={() => startEdit(designation)}
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-md p-2 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(designation.id)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

export default function Page() {
  return <AdminPageShell sectionTitle="Designations">{() => <DesignationsContent />}</AdminPageShell>;
}
