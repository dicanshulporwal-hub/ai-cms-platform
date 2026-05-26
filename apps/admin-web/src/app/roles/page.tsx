'use client';

import { useState } from 'react';
import { Loader2, Plus, Search, Shield, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDeleteRole, useRoles, useUpdateRoleStatus } from '@/hooks/use-roles';
import type { AuthUser } from '@/types/auth';

function isSuperAdmin(user: AuthUser) {
  return user.role === 'Super Admin';
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function RolesContent({ user }: { user: AuthUser }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data: roles, isLoading, isError, error } = useRoles();
  const updateStatusMutation = useUpdateRoleStatus();
  const deleteMutation = useDeleteRole();

  const canManage = isSuperAdmin(user);

  const filtered = roles?.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  if (user.role !== 'Super Admin' && user.role !== 'Admin') {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-8 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-amber-600" />
        <h2 className="mt-4 text-lg font-semibold text-amber-900">Access Restricted</h2>
        <p className="mt-2 text-sm text-amber-700">Only Super Admin and Admin users can view roles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage CMS roles and permissions.</p>
        </div>
        {canManage && (
          <Link href="/roles/new">
            <Button><Plus className="h-4 w-4" /> Create Role</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>View and manage all roles in the CMS platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" onChange={(e) => setSearch(e.target.value)} placeholder="Search roles..." value={search} />
            </div>
            <Select className="w-[150px]" onChange={(e) => setStatusFilter(e.target.value === 'all' ? '' : e.target.value)} value={statusFilter || 'all'}>
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error?.message ?? 'Failed to load roles.'}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No roles found.</TableCell></TableRow>
                  ) : (
                    filtered?.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            {role.name}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{role.description ?? '-'}</TableCell>
                        <TableCell>
                          <span className={['inline-flex items-center rounded-full px-2 py-1 text-xs font-medium', role.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'].join(' ')}>{role.status}</span>
                        </TableCell>
                        <TableCell>{role.isSystemRole ? <span className="text-xs text-amber-600 font-medium">System</span> : <span className="text-xs text-muted-foreground">Custom</span>}</TableCell>
                        <TableCell>{role.userCount}</TableCell>
                        <TableCell>{formatDate(role.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/roles/${role.id}/permissions`}><Button size="sm" variant="ghost">Permissions</Button></Link>
                            {canManage && (
                              <>
                                <Link href={`/roles/${role.id}/edit`}><Button size="sm" variant="ghost">Edit</Button></Link>
                                {role.name !== 'Super Admin' && (
                                  <Button size="sm" variant="ghost" disabled={updateStatusMutation.isPending} onClick={() => updateStatusMutation.mutateAsync({ id: role.id, status: role.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}>
                                    {role.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                  </Button>
                                )}
                                {!role.isSystemRole && (
                                  <Button size="sm" variant="ghost" className="text-destructive" disabled={deleteMutation.isPending} onClick={() => { if (confirm('Delete this role?')) deleteMutation.mutateAsync(role.id); }}>Delete</Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RolesPage() {
  return <AdminPageShell sectionTitle="Roles">{(user) => <RolesContent user={user} />}</AdminPageShell>;
}
