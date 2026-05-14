export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? 'Something went wrong.');
  }

  return data as T;
}

export async function login(input: LoginInput) {
  const response = await fetch('/api/auth/login', {
    body: JSON.stringify(input),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  return parseResponse<LoginResponse>(response);
}

export async function fetchCurrentUser() {
  const response = await fetch('/api/auth/me', {
    cache: 'no-store',
  });

  return parseResponse<AuthUser>(response);
}

export async function logout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  return parseResponse<{ status: 'ok' }>(response);
}
