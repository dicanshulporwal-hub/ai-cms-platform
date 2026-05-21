import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE, getApiBaseUrl } from '@/lib/auth';

interface BackendProxyOptions {
  body?: unknown;
  method?: string;
  requireAuth?: boolean;
}

export async function proxyToBackend(
  path: string,
  { body, method = 'GET', requireAuth = true }: BackendProxyOptions = {},
) {
  const token = cookies().get(AUTH_COOKIE)?.value;

  if (requireAuth && !token) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  let apiBaseUrl: string;

  try {
    apiBaseUrl = getApiBaseUrl();
  } catch {
    return NextResponse.json(
      { message: 'API_BASE_URL is not configured.' },
      { status: 500 },
    );
  }

  const headers = new Headers();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
    headers,
    method,
  });
  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    cookies().delete(AUTH_COOKIE);
  }

  return NextResponse.json(data ?? {}, { status: response.status });
}

export async function proxyFormDataToBackend(
  path: string,
  formData: FormData,
  { method = 'POST', requireAuth = true }: BackendProxyOptions = {},
) {
  const token = cookies().get(AUTH_COOKIE)?.value;

  if (requireAuth && !token) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  let apiBaseUrl: string;

  try {
    apiBaseUrl = getApiBaseUrl();
  } catch {
    return NextResponse.json(
      { message: 'API_BASE_URL is not configured.' },
      { status: 500 },
    );
  }

  const headers = new Headers();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    body: formData,
    cache: 'no-store',
    headers,
    method,
  });
  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    cookies().delete(AUTH_COOKIE);
  }

  return NextResponse.json(data ?? {}, { status: response.status });
}
