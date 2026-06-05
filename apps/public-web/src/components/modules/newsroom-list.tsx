import Link from 'next/link';
import type { ModuleComponentProps } from '@/types/template';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  itemType: string;
  publishedAt: string | null;
  featuredImageUrl: string | null;
}

async function fetchNews(limit: number) {
  try {
    const res = await fetch(`${API_BASE}/public/newsroom?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch { return []; }
}

export async function NewsroomListModule({ config, theme }: ModuleComponentProps) {
  const limit = (config?.limit as number) || 4;
  const items: NewsItem[] = await fetchNews(limit);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: theme?.primaryColor }}>News & Press Releases</h2>
        <Link href="/newsroom" className="text-sm text-blue-600 hover:underline">View All →</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <Link key={item.id} href={`/newsroom/${item.slug}`} className="group flex gap-3 rounded-lg border bg-white p-4 hover:shadow-md transition-shadow">
            {item.featuredImageUrl && (
              <img src={item.featuredImageUrl} alt="" className="w-20 h-16 rounded object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">{item.itemType.replace(/_/g, ' ')}</span>
              <h3 className="font-medium text-sm mt-1 group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</h3>
              {item.publishedAt && <p className="text-xs text-gray-400 mt-1">{new Date(item.publishedAt).toLocaleDateString()}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
