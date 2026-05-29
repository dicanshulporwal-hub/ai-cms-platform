import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const response = await fetch(
      `${API_BASE}/public/search?q=${encodeURIComponent(query.trim())}`
    );

    if (!response.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ results: [] });
  }
}
