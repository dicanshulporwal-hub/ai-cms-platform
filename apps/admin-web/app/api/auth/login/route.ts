import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE, getApiBaseUrl, getAuthCookieOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      { message: data?.message ?? 'Invalid credentials.' },
      { status: response.status },
    );
  }

  cookies().set(AUTH_COOKIE, data.accessToken, getAuthCookieOptions());

  return NextResponse.json({ user: data.user });
}
