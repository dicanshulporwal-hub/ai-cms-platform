'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';

interface DepartmentOption {
  id: string;
  name: string;
  status: string;
}

interface DesignationOption {
  id: string;
  name: string;
  status: string;
}

interface Officer {
  id: string;
  fullName: string;
  slug: string;
  publicEmail: string | null;
  publicPhone: string | null;
  isPublic: boolean;
  status: string;
  displayOrder: number;
  designation: { name: string } | null;
  department: { name: string } | null;
}

interface OfficerDetail extends Officer {
  departmentId: string | null;
  designationId: string | null;
  officeName: string | null;
  officePhone: string | null;
  roomNumber: string | null;
  bio: string | null;
  responsibilities: string | null;
}

const emptyForm = {
  bio: '',
  departmentId: '',
  designationId: '',
  displayOrder: '0',
  fullName: '',
  isPublic: true,
  officeName: '',
  officePhone: '',
  publicEmail: '',
  publicPhone: '',
  responsibilities: '',
  roomNumber: '',
  slug: '',
  status: 'OFFICER_ACTIVE',
};

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function OfficersContent() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [designations, setDesignations] = useState<DesignationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');

      if (search) {
        params.set('search', search);
      }

      const data: any = await apiClient(`/api/contact-directory/officers?${params}`);
      setOfficers(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    } catch {
      setOfficers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);

    try {
      const [departmentData, designationData] = await Promise.all([
        apiClient<DepartmentOption[]>('/api/contact-directory/departments'),
        apiClient<DesignationOption[]>('/api/contact-directory/designations'),
      ]);

      setDepartments(departmentData || []);
      setDesignations(designationData || []);
    } catch {
      setDepartments([]);
      setDesignations([]);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

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

  const startEdit = async (officer: Officer) => {
    setEditingId(officer.id);
    setShowForm(true);

    try {
      const detail = await apiClient<OfficerDetail>(
        `/api/contact-directory/officers/${officer.id}`,
      );

      setForm({
        bio: detail.bio ?? '',
        departmentId: detail.departmentId ?? '',
        designationId: detail.designationId ?? '',
        displayOrder: String(detail.displayOrder ?? 0),
        fullName: detail.fullName,
        isPublic: detail.isPublic,
        officeName: detail.officeName ?? '',
        officePhone: detail.officePhone ?? '',
        publicEmail: detail.publicEmail ?? '',
        publicPhone: detail.publicPhone ?? '',
        responsibilities: detail.responsibilities ?? '',
        roomNumber: detail.roomNumber ?? '',
        slug: detail.slug,
        status: detail.status ?? 'OFFICER_ACTIVE',
      });
    } catch {
      setForm({
        ...emptyForm,
        displayOrder: String(officer.displayOrder ?? 0),
        fullName: officer.fullName,
        isPublic: officer.isPublic,
        publicEmail: officer.publicEmail ?? '',
        publicPhone: officer.publicPhone ?? '',
        slug: officer.slug,
        status: officer.status ?? 'OFFICER_ACTIVE',
      });
    }
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      return;
    }

    setSaving(true);

    const payload = {
      bio: form.bio.trim() || null,
      departmentId: form.departmentId || null,
      designationId: form.designationId || null,
      displayOrder: Number(form.displayOrder) || 0,
      fullName: form.fullName.trim(),
      isPublic: form.isPublic,
      officeName: form.officeName.trim() || null,
      officePhone: form.officePhone.trim() || null,
      publicEmail: form.publicEmail.trim() || null,
      publicPhone: form.publicPhone.trim() || null,
      responsibilities: form.responsibilities.trim() || null,
      roomNumber: form.roomNumber.trim() || null,
      slug: form.slug.trim() || toSlug(form.fullName),
      status: form.status,
    };

    try {
      if (editingId) {
        await apiClient(`/api/contact-directory/officers/${editingId}`, {
          body: JSON.stringify(payload),
          method: 'PUT',
        });
      } else {
        await apiClient('/api/contact-directory/officers', {
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
    if (!confirm('Delete this officer?')) {
      return;
    }

    try {
      await apiClient(`/api/contact-directory/officers/${id}`, {
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
          <h1 className="text-2xl font-bold">Officers</h1>
        </div>
        <Button onClick={startCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Officer
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Officer' : 'Add Officer'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  value={form.fullName}
                  onChange={(event) =>
                    setForm({ ...form, fullName: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input
                  placeholder={form.fullName ? toSlug(form.fullName) : ''}
                  value={form.slug}
                  onChange={(event) =>
                    setForm({ ...form, slug: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Department</label>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  disabled={optionsLoading}
                  value={form.departmentId}
                  onChange={(event) =>
                    setForm({ ...form, departmentId: event.target.value })
                  }
                >
                  <option value="">Select department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Designation</label>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  disabled={optionsLoading}
                  value={form.designationId}
                  onChange={(event) =>
                    setForm({ ...form, designationId: event.target.value })
                  }
                >
                  <option value="">Select designation</option>
                  {designations.map((designation) => (
                    <option key={designation.id} value={designation.id}>
                      {designation.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                >
                  <option value="OFFICER_ACTIVE">Active</option>
                  <option value="OFFICER_INACTIVE">Inactive</option>
                  <option value="OFFICER_TRANSFERRED">Transferred</option>
                  <option value="OFFICER_RETIRED">Retired</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Display Order</label>
                <Input
                  type="number"
                  value={form.displayOrder}
                  onChange={(event) =>
                    setForm({ ...form, displayOrder: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Public Email</label>
                <Input
                  value={form.publicEmail}
                  onChange={(event) =>
                    setForm({ ...form, publicEmail: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Public Phone</label>
                <Input
                  value={form.publicPhone}
                  onChange={(event) =>
                    setForm({ ...form, publicPhone: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Office Name</label>
                <Input
                  value={form.officeName}
                  onChange={(event) =>
                    setForm({ ...form, officeName: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Office Phone</label>
                <Input
                  value={form.officePhone}
                  onChange={(event) =>
                    setForm({ ...form, officePhone: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Room Number</label>
                <Input
                  value={form.roomNumber}
                  onChange={(event) =>
                    setForm({ ...form, roomNumber: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  className="min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={form.bio}
                  onChange={(event) => setForm({ ...form, bio: event.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Responsibilities</label>
                <textarea
                  className="min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={form.responsibilities}
                  onChange={(event) =>
                    setForm({ ...form, responsibilities: event.target.value })
                  }
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                checked={form.isPublic}
                type="checkbox"
                onChange={(event) =>
                  setForm({ ...form, isPublic: event.target.checked })
                }
              />
              Public
            </label>

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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search officers..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Officers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : officers.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No officers found.</p>
            </div>
          ) : (
            <div className="divide-y">
              {officers.map((officer) => (
                <div
                  key={officer.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{officer.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {officer.designation?.name || 'No designation'}
                      {officer.department ? ` - ${officer.department.name}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        officer.isPublic
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {officer.isPublic ? 'Public' : 'Private'}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        officer.status === 'OFFICER_ACTIVE'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {officer.status.replace('OFFICER_', '')}
                    </span>
                    <button
                      className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                      onClick={() => startEdit(officer)}
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-md p-2 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(officer.id)}
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

      {totalPages > 1 ? (
        <div className="flex justify-center gap-2">
          <button
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          >
            Prev
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page}/{totalPages}
          </span>
          <button
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() =>
              setPage((currentPage) => Math.min(totalPages, currentPage + 1))
            }
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function Page() {
  return <AdminPageShell sectionTitle="Officers">{() => <OfficersContent />}</AdminPageShell>;
}
