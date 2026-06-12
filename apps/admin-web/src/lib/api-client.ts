interface ApiClientOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
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
  const { body, redirectOnUnauthorized = true, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const isUrlEncoded =
    typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;
  const isBlob = typeof Blob !== 'undefined' && body instanceof Blob;
  const isArrayBuffer = typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer;
  const isArrayBufferView = typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(body);
  const isRawBody =
    typeof body === 'string' ||
    isFormData ||
    isUrlEncoded ||
    isBlob ||
    isArrayBuffer ||
    isArrayBufferView;

  if (
    body !== undefined &&
    !headers.has('Content-Type') &&
    !isFormData &&
    (typeof body === 'string' || !isRawBody)
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(getPublicApiUrl(path), {
    ...requestOptions,
    body: body === undefined ? undefined : isRawBody ? (body as BodyInit) : JSON.stringify(body),
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
