function getApiBaseUrl() {
  return (process.env.PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3001').replace(
    /\/$/,
    '',
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const response = await fetch(`${getApiBaseUrl()}/chatbot/message`, {
    body: JSON.stringify(body),
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': request.headers.get('user-agent') ?? '',
      'X-Forwarded-For': request.headers.get('x-forwarded-for') ?? '',
    },
    method: 'POST',
  });
  const data = await response.json().catch(() => null);

  return Response.json(data ?? {}, { status: response.status });
}
