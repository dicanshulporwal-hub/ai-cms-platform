'use client';

import { useCallback, useEffect, useState } from 'react';
import { Building2, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';

interface Dept {
  id: string;
  name: string;
  slug: string;
  shortName: string | null;
  departmentType: string;
  parentId: string | null;
  status: string;
  sortOrder: number;
  contactEmail?: string | null;
  contactPhone?: string | null;
  officeAddress?: string | null;
  websiteUrl?: string | null;
}

const emptyForm = {
  contactEmail: '',
  contactPhone: '',
  departmentType: 'DEPARTMENT',
  name: '',
  officeAddress: '',
  shortName: '',
  slug: '',
  status: 'DEPT_ACTIVE',
  websiteUrl: '',
};

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function DepartmentsContent() {
  const [depts, setDepts] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await apiClient<Dept[]>('/api/contact-directory/departments');
      setDepts(data || []);
    } catch {
      setDepts([]);
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

  const startEdit = async (dept: Dept) => {
    setShowForm(true);
    setEditingId(dept.id);

    try {
      const detail = await apiClient<Dept>(`/api/contact-directory/departments/${dept.id}`);
      setForm({
        contactEmail: detail.contactEmail ?? '',
        contactPhone: detail.contactPhone ?? '',
        departmentType: detail.departmentType ?? 'DEPARTMENT',
        name: detail.name ?? '',
        officeAddress: detail.officeAddress ?? '',
        shortName: detail.shortName ?? '',
        slug: detail.slug ?? '',
        status: detail.status ?? 'DEPT_ACTIVE',
        websiteUrl: detail.websiteUrl ?? '',
      });
    } catch {
      setForm({
        contactEmail: dept.contactEmail ?? '',
        contactPhone: dept.contactPhone ?? '',
        departmentType: dept.departmentType ?? 'DEPARTMENT',
        name: dept.name,
        officeAddress: '',
        shortName: dept.shortName ?? '',
        slug: dept.slug,
        status: dept.status ?? 'DEPT_ACTIVE',
        websiteUrl: '',
      });
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      return;
    }

    setSaving(true);

    const payload = {
      contactEmail: form.contactEmail.trim() || null,
      contactPhone: form.contactPhone.trim() || null,
      departmentType: form.departmentType,
      name: form.name.trim(),
      officeAddress: form.officeAddress.trim() || null,
      shortName: form.shortName.trim() || null,
      slug: form.slug.trim() || toSlug(form.name),
      status: form.status,
      websiteUrl: form.websiteUrl.trim() || null,
    };

    try {
      if (editingId) {
        await apiClient(`/api/contact-directory/departments/${editingId}`, {
          body: JSON.stringify(payload),
          method: 'PUT',
        });
      } else {
        await apiClient('/api/contact-directory/departments', {
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
    if (!confirm('Delete this department?')) {
      return;
    }

    try {
      await apiClient(`/api/contact-directory/departments/${id}`, {
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
          <h1 className="text-2xl font-bold">Departments</h1>
        </div>
        <Button onClick={startCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Department' : 'Add Department'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
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
                <label className="text-sm font-medium">Short Name</label>
                <Input
                  value={form.shortName}
                  onChange={(event) =>
                    setForm({ ...form, shortName: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={form.departmentType}
                  onChange={(event) =>
                    setForm({ ...form, departmentType: event.target.value })
                  }
                >
                  <option value="DEPARTMENT">Department</option>
                  <option value="DIVISION">Division</option>
                  <option value="SECTION">Section</option>
                  <option value="UNIT">Unit</option>
                  <option value="OFFICE">Office</option>
                  <option value="CELL">Cell</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                >
                  <option value="DEPT_ACTIVE">Active</option>
                  <option value="DEPT_INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Contact Email</label>
                <Input
                  value={form.contactEmail}
                  onChange={(event) =>
                    setForm({ ...form, contactEmail: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Phone</label>
                <Input
                  value={form.contactPhone}
                  onChange={(event) =>
                    setForm({ ...form, contactPhone: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Website URL</label>
                <Input
                  value={form.websiteUrl}
                  onChange={(event) =>
                    setForm({ ...form, websiteUrl: event.target.value })
                  }
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-sm font-medium">Office Address</label>
                <Input
                  value={form.officeAddress}
                  onChange={(event) =>
                    setForm({ ...form, officeAddress: event.target.value })
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
          <CardTitle>All Departments ({depts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : depts.length === 0 ? (
            <div className="py-8 text-center">
              <Building2 className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No departments yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {depts.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {dept.name}
                      {dept.shortName ? ` (${dept.shortName})` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dept.departmentType} - /{dept.slug}
                      {dept.contactEmail ? ` - ${dept.contactEmail}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        dept.status === 'DEPT_ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {dept.status === 'DEPT_ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                      onClick={() => startEdit(dept)}
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-md p-2 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(dept.id)}
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
  return <AdminPageShell sectionTitle="Departments">{() => <DepartmentsContent />}</AdminPageShell>;
}
