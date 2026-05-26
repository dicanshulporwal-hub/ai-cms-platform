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
import { Textarea } from '@/components/ui/textarea';
import { useCreateRole } from '@/hooks/use-roles';
import type { AuthUser } from '@/types/auth';

function CreateRoleContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const createMutation = useCreateRole();

  if (user.role !== 'Super Admin') {
    return <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-8 text-center"><p className="text-amber-700">Only Super Admin can create roles.</p></div>;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) { setFormError('Role name is required.'); return; }
    try {
      await createMutation.mutateAsync({ name: name.trim(), description: description.trim() || undefined });
      router.push('/roles');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create role.');
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Link href="/roles"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Roles</Button></Link>
      <div><h1 className="text-2xl font-semibold">Create New Role</h1><p className="mt-1 text-sm text-muted-foreground">Add a custom role to the CMS.</p></div>
      {formError && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>}
      <Card>
        <CardHeader><CardTitle>Role Details</CardTitle><CardDescription>Define the role name and description.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="name">Name *</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Content Manager" maxLength={100} required disabled={createMutation.isPending} /></div>
          <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what this role does..." maxLength={500} disabled={createMutation.isPending} /></div>
        </CardContent>
      </Card>
      <div className="flex items-center gap-3">
        <Button disabled={createMutation.isPending} type="submit">{createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Create Role</Button>
        <Link href="/roles"><Button type="button" variant="outline" disabled={createMutation.isPending}>Cancel</Button></Link>
      </div>
    </form>
  );
}

export default function NewRolePage() {
  return <AdminPageShell sectionTitle="Create Role">{(user) => <CreateRoleContent user={user} />}</AdminPageShell>;
}
