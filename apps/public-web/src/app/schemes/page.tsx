import Link from 'next/link';
import { FileText } from 'lucide-react';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface SchemeItem { id: string; title: string; slug: string; summary: string | null; type: string; applicationMode: string; targetAudience: string | null; publishedAt: string | null; category: { name: string; slug: string } | null; department: { name: string; slug: string } | null; }

async function fetchSchemes(): Promise<{ data: SchemeItem[]; meta: any } | null> {
  try { const res = await fetch(`${API_BASE}/public/schemes?limit=20`, { cache: 'no-store' }); if (!res.ok) return null; return res.json(); } catch { return null; }
}

export default async function PublicSchemesPage() {
  const result = await fetchSchemes();
  const items = result?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--template-text, #111827)' }}>Government Schemes</h1>
        <p className="mt-2 text-muted-foreground">Browse schemes available for citizens</p>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-16"><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No schemes available at this time.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link key={item.id} href={`/schemes/${item.slug}`} className="group block rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Scheme</span>
                {item.applicationMode && item.applicationMode !== 'NOT_APPLICABLE' && <span className="px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700">{item.applicationMode}</span>}
              </div>
              <h2 className="font-semibold group-hover:text-primary transition-colors">{item.title}</h2>
              {item.summary && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{item.summary}</p>}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {item.category && <span className="bg-muted px-2 py-0.5 rounded">{item.category.name}</span>}
                {item.department && <span className="bg-muted px-2 py-0.5 rounded">{item.department.name}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
