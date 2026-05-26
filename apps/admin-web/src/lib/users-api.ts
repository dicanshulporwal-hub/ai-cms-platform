import { apiClient } from '@/lib/api-client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roleId: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  roleId?: string;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export async function fetchUsers(params: UsersQueryParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);
  if (params.roleId) searchParams.set('roleId', params.roleId);
  if (params.status) searchParams.set('status', params.status);

  const queryString = searchParams.toString();
  const path = queryString ? `/api/users?${queryString}` : '/api/users';

  return apiClient<UserListResponse>(path, { cache: 'no-store' });
}

export async function fetchUser(id: string) {
  return apiClient<User>(`/api/users/${id}`, { cache: 'no-store' });
}

export async function createUser(data: CreateUserInput) {
  return apiClient<User>('/api/users', {
    body: JSON.stringify(data),
    method: 'POST',
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  return apiClient<User>(`/api/users/${id}`, {
    body: JSON.stringify(data),
    method: 'PUT',
  });
}

export async function updateUserStatus(
  id: string,
  status: 'ACTIVE' | 'INACTIVE',
) {
  return apiClient<User>(`/api/users/${id}/status`, {
    body: JSON.stringify({ status }),
    method: 'PATCH',
  });
}

export async function deleteUser(id: string) {
  return apiClient<{ message: string }>(`/api/users/${id}`, {
    method: 'DELETE',
  });
}
