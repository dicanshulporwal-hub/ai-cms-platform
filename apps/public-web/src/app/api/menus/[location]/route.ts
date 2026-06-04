function getApiBaseUrl() {
  return (process.env.PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3001').replace(
    /\/$/,
    '',
  );
}

export async function GET(
  _request: Request,
  { params }: { params: { location: string } },
) {
  const location = params.location;
  const response = await fetch(
    `${getApiBaseUrl()}/public/menus/location/${encodeURIComponent(location)}`,
    { cache: 'no-store' },
  );
  const data = await response.json().catch(() => null);

  return Response.json(data ?? {}, { status: response.status });
}
