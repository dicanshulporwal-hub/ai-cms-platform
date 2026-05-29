import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ error: 'Form slug is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_BASE}/public/forms/${encodeURIComponent(slug)}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch form' },
      { status: 502 }
    );
  }
}
