import Link from 'next/link';
import { FileText, Calendar } from 'lucide-react';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface PRItem { id: string; title: string; slug: string; summary: string | null; publishedAt: string | null; eventDate: string | null; category: { name: string } | null; }

async function fetchPressReleases() { try { const res = await fetch(`${API_BASE}/public/press-releases?limit=20`, { cache: 'no-store' }); if (!res.ok) return null; return res.json(); } catch { return null; } }

export default async function PublicPressReleasesPage() {
  const result = await fetchPressReleases();
  const items: PRItem[] = result?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8"><h1 className="text-3xl font-bold" style={{ color: 'var(--template-text, #111827)' }}>Press Releases</h1><p className="mt-2 text-muted-foreground">Official press releases and communications</p></div>
      {items.length === 0 ? (
        <div className="text-center py-16"><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No press releases at this time.</p></div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <Link key={item.id} href={`/newsroom/${item.slug}`} className="group block rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
              <h2 className="font-semibold group-hover:text-primary transition-colors">{item.title}</h2>
              {item.summary && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>}
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                {item.publishedAt && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(item.publishedAt).toLocaleDateString()}</span>}
                {item.category && <span>{item.category.name}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
