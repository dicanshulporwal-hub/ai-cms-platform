function getApiBaseUrl() {
  return (process.env.PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3001').replace(
    /\/$/,
    '',
  );
}

export async function GET() {
  const response = await fetch(`${getApiBaseUrl()}/chatbot/public-settings`, {
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);

  return Response.json(data ?? {}, { status: response.status });
}
