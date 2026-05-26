'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useUpdateUser, useUser } from '@/hooks/use-users';
import { useRoles } from '@/hooks/use-roles';
import type { AuthUser } from '@/types/auth';

function canEditUser(currentUser: AuthUser, targetRole: string) {
  if (currentUser.role === 'Super Admin') return true;
  if (currentUser.role === 'Admin') {
    return targetRole !== 'Super Admin' && targetRole !== 'Admin';
  }
  return false;
}

function EditUserContent({
  currentUser,
  userId,
}: {
  currentUser: AuthUser;
  userId: string;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { data: userData, isLoading: userLoading, error: userError } = useUser(userId);
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const updateMutation = useUpdateUser();

  // Initialize form with user data
  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setEmail(userData.email);
      setRoleId(userData.role.id);
    }
  }, [userData]);

  // Filter roles based on current user's role
  const availableRoles = rolesData?.filter((role) => {
    if (currentUser.role === 'Super Admin') return true;
    if (currentUser.role === 'Admin') {
      return role.name !== 'Super Admin' && role.name !== 'Admin';
    }
    return false;
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setFormError('Name is required.');
      return;
    }

    if (!trimmedEmail) {
      setFormError('Email is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!roleId) {
      setFormError('Please select a role.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        data: {
          email: trimmedEmail.toLowerCase(),
          name: trimmedName,
          roleId,
        },
        id: userId,
      });
      router.push('/users');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Failed to update user.',
      );
    }
  }

  if (userLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (userError || !userData) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {userError?.message ?? 'User not found.'}
      </div>
    );
  }

  if (!canEditUser(currentUser, userData.role.name)) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-8 text-center">
        <h2 className="text-lg font-semibold text-amber-900">Access Restricted</h2>
        <p className="mt-2 text-sm text-amber-700">
          You do not have permission to edit this user.
        </p>
      </div>
    );
  }

  if (userData.id === currentUser.id) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-8 text-center">
        <h2 className="text-lg font-semibold text-amber-900">Action Not Allowed</h2>
        <p className="mt-2 text-sm text-amber-700">
          You cannot edit your own account from this page.
        </p>
        <Link href="/users" className="mt-4 inline-block">
          <Button variant="outline">Back to Users</Button>
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex items-center gap-4">
        <Link href="/users">
          <Button size="sm" variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">Edit User</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update user information and role assignment.
        </p>
      </div>

      {formError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Update the user's information and role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                disabled={updateMutation.isPending}
                id="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                value={name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                disabled={updateMutation.isPending}
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                type="email"
                value={email}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                disabled={updateMutation.isPending}
                onChange={(e) => setRoleId(e.target.value)}
                value={roleId}
              >
                <option value="" disabled>
                  Select a role
                </option>
                {availableRoles?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                    {role.description ? ` - ${role.description}` : ''}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <div className="flex items-center gap-2">
                <span
                  className={[
                    'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                    userData.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-700',
                  ].join(' ')}
                >
                  {userData.status}
                </span>
                <Link
                  className="text-sm text-primary hover:underline"
                  href="/users"
                >
                  Change status from users list
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button disabled={updateMutation.isPending} type="submit">
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
        <Link href="/users">
          <Button disabled={updateMutation.isPending} type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  return (
    <AdminPageShell sectionTitle="Edit User">
      {(user) => <EditUserContent currentUser={user} userId={params.id} />}
    </AdminPageShell>
  );
}
