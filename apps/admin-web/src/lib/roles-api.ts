import { apiClient } from '@/lib/api-client';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, string[]> | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRolePermissionsInput {
  permissions: Record<string, string[]>;
}

export async function fetchRoles() {
  return apiClient<Role[]>('/api/roles', { cache: 'no-store' });
}

export async function fetchRole(id: string) {
  return apiClient<Role>(`/api/roles/${id}`, { cache: 'no-store' });
}

export async function updateRolePermissions(
  id: string,
  data: UpdateRolePermissionsInput,
) {
  return apiClient<Role>(`/api/roles/${id}/permissions`, {
    body: JSON.stringify(data),
    method: 'PUT',
  });
}
