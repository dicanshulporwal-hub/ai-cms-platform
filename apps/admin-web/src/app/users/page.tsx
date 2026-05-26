'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  ShieldAlert,
  UserCog,
} from 'lucide-react';
import Link from 'next/link';
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
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDeleteUser, useUpdateUserStatus, useUsers } from '@/hooks/use-users';
import { useRoles } from '@/hooks/use-roles';
import type { AuthUser } from '@/types/auth';

const statusBadgeStyles: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
};

function canManageUsers(user: AuthUser) {
  return user.role === 'Super Admin' || user.role === 'Admin';
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function UsersContent({ user }: { user: AuthUser }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleId, setRoleId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: rolesData } = useRoles();
  const { data: usersData, isLoading, isError, error } = useUsers({
    limit: 10,
    page,
    roleId: roleId || undefined,
    search: search || undefined,
    status: statusFilter as 'ACTIVE' | 'INACTIVE' | undefined,
  });

  const updateStatusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteUser();

  const canManage = canManageUsers(user);
  const totalPages = usersData ? Math.ceil(usersData.total / usersData.limit) : 1;

  async function handleStatusToggle(userId: string, currentStatus: string) {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateStatusMutation.mutateAsync({ id: userId, status: newStatus });
    } catch {
      // Error is handled by toast
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(userId);
    } catch {
      // Error is handled by toast
    }
  }

  if (!canManage) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-8 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-amber-600" />
        <h2 className="mt-4 text-lg font-semibold text-amber-900">Access Restricted</h2>
        <p className="mt-2 text-sm text-amber-700">
          Only Super Admin and Admin users can access user management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage CMS users, roles, and permissions.
          </p>
        </div>
        <Link href="/users/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all users in the CMS platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name or email..."
                value={search}
              />
            </div>
            <Select
              className="w-[180px]"
              onChange={(e) => {
                setRoleId(e.target.value === 'all' ? '' : e.target.value);
                setPage(1);
              }}
              value={roleId || 'all'}
            >
              <option value="all">All Roles</option>
              {rolesData?.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
            <Select
              className="w-[150px]"
              onChange={(e) => {
                setStatusFilter(e.target.value === 'all' ? '' : e.target.value);
                setPage(1);
              }}
              value={statusFilter || 'all'}
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error?.message ?? 'Failed to load users.'}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData?.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      usersData?.data.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              {u.role.name}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={[
                                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                                statusBadgeStyles[u.status],
                              ].join(' ')}
                            >
                              {u.status}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(u.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/users/${u.id}/edit`}>
                                <Button size="sm" variant="ghost">
                                  <UserCog className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                disabled={u.id === user.id || updateStatusMutation.isPending}
                                onClick={() => handleStatusToggle(u.id, u.status)}
                                size="sm"
                                variant="ghost"
                              >
                                {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                className="text-destructive hover:text-destructive"
                                disabled={u.id === user.id || deleteMutation.isPending}
                                onClick={() => handleDelete(u.id)}
                                size="sm"
                                variant="ghost"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {usersData ? `Showing ${usersData.data.length} of ${usersData.total} users` : ''}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    size="sm"
                    variant="outline"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    size="sm"
                    variant="outline"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminPageShell sectionTitle="Users">
      {(user) => <UsersContent user={user} />}
    </AdminPageShell>
  );
}
