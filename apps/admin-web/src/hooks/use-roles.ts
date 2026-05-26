import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRole,
  deleteRole,
  fetchPermissionGroups,
  fetchRole,
  fetchRoles,
  updateRole,
  updateRolePermissions,
  updateRoleStatus,
  type CreateRoleInput,
  type UpdateRoleInput,
  type UpdateRolePermissionsInput,
} from '@/lib/roles-api';

export const rolesQueryKey = ['roles'] as const;

export function useRoles() {
  return useQuery({
    queryFn: fetchRoles,
    queryKey: rolesQueryKey,
  });
}

export function useRole(id: string) {
  return useQuery({
    enabled: !!id,
    queryFn: () => fetchRole(id),
    queryKey: [...rolesQueryKey, id],
  });
}

export function usePermissionGroups() {
  return useQuery({
    queryFn: fetchPermissionGroups,
    queryKey: ['permission-groups'],
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleInput) => createRole(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rolesQueryKey }),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleInput }) =>
      updateRole(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rolesQueryKey }),
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRolePermissionsInput }) =>
      updateRolePermissions(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rolesQueryKey }),
  });
}

export function useUpdateRoleStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      updateRoleStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rolesQueryKey }),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rolesQueryKey }),
  });
}
