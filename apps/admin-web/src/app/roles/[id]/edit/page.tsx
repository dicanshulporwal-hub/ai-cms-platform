'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Save, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRole, useUpdateRole } from '@/hooks/use-roles';
import type { AuthUser } from '@/types/auth';

function EditRoleContent({ user, roleId }: { user: AuthUser; roleId: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const { data: role, isLoading, error: loadError } = useRole(roleId);
  const updateMutation = useUpdateRole();

  useEffect(() => { if (role) { setName(role.name); setDescription(role.description ?? ''); } }, [role]);

  if (user.role !== 'Super Admin') {
    return <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-8 text-center"><p className="text-amber-700">Only Super Admin can edit roles.</p></div>;
  }
  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (loadError || !role) return <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{loadError?.message ?? 'Role not found.'}</div>;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) { setFormError('Role name is required.'); return; }
    try {
      await updateMutation.mutateAsync({ id: roleId, data: { name: name.trim(), description: description.trim() || undefined } });
      router.push('/roles');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update role.');
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Link href="/roles"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Roles</Button></Link>
      <div><h1 className="text-2xl font-semibold">Edit Role</h1><p className="mt-1 text-sm text-muted-foreground">Update role details.</p></div>
      {role.isSystemRole && <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> This is a system role. The name cannot be changed.</div>}
      {formError && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>}
      <Card>
        <CardHeader><CardTitle>Role Details</CardTitle><CardDescription>Update the role name and description.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="name">Name *</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Role name" maxLength={100} required disabled={updateMutation.isPending || role.isSystemRole} /></div>
          <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what this role does..." maxLength={500} disabled={updateMutation.isPending} /></div>
        </CardContent>
      </Card>
      <div className="flex items-center gap-3">
        <Button disabled={updateMutation.isPending} type="submit">{updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes</Button>
        <Link href="/roles"><Button type="button" variant="outline" disabled={updateMutation.isPending}>Cancel</Button></Link>
      </div>
    </form>
  );
}

export default function EditRolePage({ params }: { params: { id: string } }) {
  return <AdminPageShell sectionTitle="Edit Role">{(user) => <EditRoleContent user={user} roleId={params.id} />}</AdminPageShell>;
}
