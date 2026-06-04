import Link from 'next/link';
import { Newspaper, Calendar, MapPin } from 'lucide-react';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface NRItem { id: string; title: string; slug: string; summary: string | null; itemType: string; priority: string; eventDate: string | null; publishedAt: string | null; featuredImageUrl: string | null; location: string | null; category: { name: string; slug: string } | null; }

async function fetchNewsroom() { try { const res = await fetch(`${API_BASE}/public/newsroom?limit=20`, { cache: 'no-store' }); if (!res.ok) return null; return res.json(); } catch { return null; } }

const TYPE_LABELS: Record<string, string> = { PRESS_RELEASE: 'Press Release', MEDIA_COVERAGE: 'Media Coverage', PHOTO_GALLERY_ITEM: 'Photo', VIDEO: 'Video', SPEECH: 'Speech', NEWS_UPDATE: 'News' };

export default async function PublicNewsroomPage() {
  const result = await fetchNewsroom();
  const items: NRItem[] = result?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8"><h1 className="text-3xl font-bold" style={{ color: 'var(--template-text, #111827)' }}>Newsroom</h1><p className="mt-2 text-muted-foreground">Press releases, news updates, and media coverage</p></div>
      {items.length === 0 ? (
        <div className="text-center py-16"><Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No news items available.</p></div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <Link key={item.id} href={`/newsroom/${item.slug}`} className="group flex items-start gap-4 rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
              {item.featuredImageUrl && <img src={item.featuredImageUrl} alt="" className="w-24 h-20 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700">{TYPE_LABELS[item.itemType] || item.itemType}</span>
                  {item.priority === 'NR_FEATURED' && <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700">Featured</span>}
                  {item.category && <span className="text-[10px] text-muted-foreground">{item.category.name}</span>}
                </div>
                <h2 className="font-semibold group-hover:text-primary transition-colors">{item.title}</h2>
                {item.summary && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>}
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  {item.publishedAt && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(item.publishedAt).toLocaleDateString()}</span>}
                  {item.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
