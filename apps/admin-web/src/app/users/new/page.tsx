'use client';

import { FormEvent, useState } from 'react';
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
import { useCreateUser } from '@/hooks/use-users';
import { useRoles } from '@/hooks/use-roles';
import type { AuthUser } from '@/types/auth';

function canCreateUser(user: AuthUser) {
  return user.role === 'Super Admin' || user.role === 'Admin';
}

function CreateUserContent({ currentUser }: { currentUser: AuthUser }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);

  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const createMutation = useCreateUser();

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

    if (!password) {
      setFormError('Password is required.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    if (!roleId) {
      setFormError('Please select a role.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        email: trimmedEmail.toLowerCase(),
        name: trimmedName,
        password,
        roleId,
        status,
      });
      router.push('/users');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Failed to create user.',
      );
    }
  }

  if (!canCreateUser(currentUser)) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-8 text-center">
        <h2 className="text-lg font-semibold text-amber-900">Access Restricted</h2>
        <p className="mt-2 text-sm text-amber-700">
          Only Super Admin and Admin users can create new users.
        </p>
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
        <h1 className="text-2xl font-semibold">Create New User</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new user to the CMS platform.
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
            Enter the user's information and assign a role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                disabled={createMutation.isPending}
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
                disabled={createMutation.isPending}
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
              <Label htmlFor="password">Password *</Label>
              <Input
                disabled={createMutation.isPending}
                id="password"
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                type="password"
                value={password}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              {rolesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading roles...
                </div>
              ) : (
                <Select
                  disabled={createMutation.isPending}
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
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                disabled={createMutation.isPending}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                value={status}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button disabled={createMutation.isPending} type="submit">
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Create User
        </Button>
        <Link href="/users">
          <Button disabled={createMutation.isPending} type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}

export default function NewUserPage() {
  return (
    <AdminPageShell sectionTitle="Create User">
      {(user) => <CreateUserContent currentUser={user} />}
    </AdminPageShell>
  );
}
