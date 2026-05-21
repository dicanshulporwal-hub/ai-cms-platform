interface ApiClientOptions extends RequestInit {
  redirectOnUnauthorized?: boolean;
}

function getPublicApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

async function parseJson(response: Response) {
  return response.json().catch(() => null);
}

export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { redirectOnUnauthorized = true, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);
  const isFormData =
    typeof FormData !== 'undefined' && requestOptions.body instanceof FormData;

  if (requestOptions.body && !headers.has('Content-Type') && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(getPublicApiUrl(path), {
    ...requestOptions,
    credentials: 'include',
    headers,
  });
  const data = await parseJson(response);

  if (
    response.status === 401 &&
    redirectOnUnauthorized &&
    typeof window !== 'undefined' &&
    !window.location.pathname.startsWith('/login')
  ) {
    window.location.assign('/login');
  }

  if (!response.ok) {
    throw new Error(data?.message ?? 'Something went wrong.');
  }

  return data as T;
}
