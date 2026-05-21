import { apiClient } from '@/lib/api-client';
import type { AuthUser, LoginInput, LoginResponse } from '@/types/auth';

export async function login(input: LoginInput) {
  return apiClient<LoginResponse>('/api/auth/login', {
    body: JSON.stringify(input),
    method: 'POST',
  });
}

export async function fetchCurrentUser() {
  return apiClient<AuthUser>('/api/auth/me', {
    cache: 'no-store',
  });
}

export async function logout() {
  return apiClient<{ status: 'ok' }>('/api/auth/logout', {
    method: 'POST',
  });
}

export type { AuthUser, LoginInput, LoginResponse };
