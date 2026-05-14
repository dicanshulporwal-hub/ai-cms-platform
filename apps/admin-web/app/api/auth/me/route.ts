import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE, getApiBaseUrl } from '@/lib/auth';

export async function GET() {
  const token = cookies().get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    cookies().delete(AUTH_COOKIE);

    return NextResponse.json(
      { message: data?.message ?? 'Unauthorized.' },
      { status: response.status },
    );
  }

  return NextResponse.json(data);
}
