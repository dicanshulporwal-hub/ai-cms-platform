'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Loader2, Save, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissionGroups, useRole, useUpdateRolePermissions } from '@/hooks/use-roles';
import type { AuthUser } from '@/types/auth';

function PermissionsContent({ user, roleId }: { user: AuthUser; roleId: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { data: role, isLoading: roleLoading } = useRole(roleId);
  const { data: groups, isLoading: groupsLoading } = usePermissionGroups();
  const updateMutation = useUpdateRolePermissions();
  const canEdit = user.role === 'Super Admin' && role?.name !== 'Super Admin';

  useEffect(() => {
    if (role?.permissions) setSelected(role.permissions as string[]);
  }, [role]);

  function togglePermission(perm: string) {
    setSelected((prev) => prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]);
  }

  function toggleGroup(perms: string[], allSelected: boolean) {
    if (allSelected) setSelected((prev) => prev.filter((p) => !perms.includes(p)));
    else setSelected((prev) => [...new Set([...prev, ...perms])]);
  }

  async function handleSave() {
    setErrorMsg(null); setSuccessMsg(null);
    try {
      await updateMutation.mutateAsync({ id: roleId, data: { permissions: selected } });
      setSuccessMsg('Permissions saved successfully.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save permissions.');
    }
  }

  if (roleLoading || groupsLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!role) return <div className="text-destructive">Role not found.</div>;

  return (
    <div className="space-y-6">
      <Link href="/roles"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Roles</Button></Link>
      <div><h1 className="text-2xl font-semibold">Permissions: {role.name}</h1><p className="mt-1 text-sm text-muted-foreground">{canEdit ? 'Select permissions for this role.' : 'View permissions (read-only).'}</p></div>
      {role.name === 'Super Admin' && <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Super Admin has all permissions and cannot be modified.</div>}
      {successMsg && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 flex items-center gap-2"><Check className="h-4 w-4" />{successMsg}</div>}
      {errorMsg && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMsg}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups?.map((group) => {
          const allSelected = group.permissions.every((p) => selected.includes(p));
          const someSelected = group.permissions.some((p) => selected.includes(p));
          return (
            <Card key={group.key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{group.label}</CardTitle>
                  {canEdit && (
                    <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => toggleGroup(group.permissions, allSelected)}>
                      {allSelected ? 'Clear All' : 'Select All'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.permissions.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={selected.includes(perm)} onChange={() => canEdit && togglePermission(perm)} disabled={!canEdit} className="rounded border-border" />
                    <span className="text-muted-foreground">{perm}</span>
                  </label>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {canEdit && (
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={updateMutation.isPending}>{updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Permissions</Button>
          <span className="text-sm text-muted-foreground">{selected.length} permissions selected</span>
        </div>
      )}
    </div>
  );
}

export default function RolePermissionsPage({ params }: { params: { id: string } }) {
  return <AdminPageShell sectionTitle="Role Permissions">{(user) => <PermissionsContent user={user} roleId={params.id} />}</AdminPageShell>;
}
