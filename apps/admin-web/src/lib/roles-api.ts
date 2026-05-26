import { apiClient } from '@/lib/api-client';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[] | null;
  isSystemRole: boolean;
  status: string;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionGroup {
  key: string;
  label: string;
  permissions: string[];
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

export interface UpdateRolePermissionsInput {
  permissions: string[];
}

export async function fetchRoles() {
  return apiClient<Role[]>('/api/roles', { cache: 'no-store' });
}

export async function fetchRole(id: string) {
  return apiClient<Role>(`/api/roles/${id}`, { cache: 'no-store' });
}

export async function fetchPermissionGroups() {
  return apiClient<PermissionGroup[]>('/api/roles/permissions', { cache: 'no-store' });
}

export async function createRole(data: CreateRoleInput) {
  return apiClient<Role>('/api/roles', {
    body: JSON.stringify(data),
    method: 'POST',
  });
}

export async function updateRole(id: string, data: UpdateRoleInput) {
  return apiClient<Role>(`/api/roles/${id}`, {
    body: JSON.stringify(data),
    method: 'PUT',
  });
}

export async function updateRolePermissions(id: string, data: UpdateRolePermissionsInput) {
  return apiClient<Role>(`/api/roles/${id}/permissions`, {
    body: JSON.stringify(data),
    method: 'PATCH',
  });
}

export async function updateRoleStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
  return apiClient<Role>(`/api/roles/${id}/status`, {
    body: JSON.stringify({ status }),
    method: 'PATCH',
  });
}

export async function deleteRole(id: string) {
  return apiClient<{ message: string }>(`/api/roles/${id}`, {
    method: 'DELETE',
  });
}
