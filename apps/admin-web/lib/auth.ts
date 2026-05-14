import { cookies } from 'next/headers';
import { AUTH_COOKIE } from './auth-cookie';

export { AUTH_COOKIE };

export function getApiBaseUrl() {
  return process.env.API_BASE_URL ?? 'http://localhost:3001';
}

export function getAuthToken() {
  return cookies().get(AUTH_COOKIE)?.value;
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  };
}
