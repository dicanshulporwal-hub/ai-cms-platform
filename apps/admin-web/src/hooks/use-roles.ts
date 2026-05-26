import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchRole,
  fetchRoles,
  updateRolePermissions,
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

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, id }: { id: string; data: UpdateRolePermissionsInput }) =>
      updateRolePermissions(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKey });
    },
  });
}
