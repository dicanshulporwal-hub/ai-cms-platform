import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE, getApiBaseUrl } from '@/lib/auth';

export async function POST() {
  const token = cookies().get(AUTH_COOKIE)?.value;

  if (token) {
    try {
      await fetch(`${getApiBaseUrl()}/auth/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
      }).catch(() => null);
    } catch {
      // Logout should still clear the local cookie if backend config is missing.
    }
  }

  cookies().delete(AUTH_COOKIE);

  return NextResponse.json({ status: 'ok' });
}
