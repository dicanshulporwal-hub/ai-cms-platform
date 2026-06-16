import Link from 'next/link';
import { PublicSection } from '@/design-system/components/PublicSection';
import { PublicCard } from '@/design-system/components/PublicCard';
import { PublicBadge } from '@/design-system/components/PublicBadge';
import { PublicGrid } from '@/design-system/components/PublicGrid';
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
    const res = await fetch(`${API_BASE}/public/newsroom?limit=${limit}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

function typeLabel(type: string) {
  return type?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function NewsroomListModule({ config, moduleKey }: ModuleComponentProps) {
  const limit = Number(config?.limit) || 4;
  const showTitle = config?.showTitle !== false;
  const displayTitle = (config?.displayTitle as string) || 'Newsroom';
  const displayMode = (config?.displayMode as string) || 'cards';

  const items: NewsItem[] = await fetchNews(limit);
  if (items.length === 0) return null;

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      spacingVariant="md"
      id={`module-${moduleKey}`}
      actionLink={
        <Link href="/newsroom" className="text-sm font-medium text-[var(--public-primary)] hover:underline">
          View all →
        </Link>
      }
    >
      <div data-module-type="NEWSROOM_LIST">
        <PublicGrid cols={displayMode === 'grid' ? 3 : 2} gap="md">
          {items.map((item) => (
            <PublicCard
              key={item.id}
              variant="bordered"
              image={
                item.featuredImageUrl
                  ? { src: item.featuredImageUrl, alt: item.title }
                  : undefined
              }
              badge={<PublicBadge variant="info">{typeLabel(item.itemType)}</PublicBadge>}
              footer={
                item.publishedAt ? (
                  <time
                    dateTime={item.publishedAt}
                    className="text-xs text-[var(--public-text-muted)]"
                  >
                    {new Date(item.publishedAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </time>
                ) : undefined
              }
            >
              <Link
                href={`/newsroom/${item.slug}`}
                className="block text-sm font-semibold text-[var(--public-text)] hover:text-[var(--public-primary)] line-clamp-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
              >
                {item.title}
              </Link>
              {item.summary && (
                <p className="mt-1 text-xs text-[var(--public-text-muted)] line-clamp-2">
                  {item.summary}
                </p>
              )}
            </PublicCard>
          ))}
        </PublicGrid>
      </div>
    </PublicSection>
  );
}
