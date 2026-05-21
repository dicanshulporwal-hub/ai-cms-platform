import { cookies } from 'next/headers';
import { AUTH_COOKIE } from './auth-cookie';

export { AUTH_COOKIE };

export function getApiBaseUrl() {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('API_BASE_URL is not configured for admin-web.');
  }

  return apiBaseUrl.replace(/\/$/, '');
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
