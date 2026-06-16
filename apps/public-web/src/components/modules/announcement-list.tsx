import Link from 'next/link';
import { PublicSection } from '@/design-system/components/PublicSection';
import { PublicBadge } from '@/design-system/components/PublicBadge';
import { PublicAlert } from '@/design-system/components/PublicAlert';
import type { ModuleComponentProps } from '@/types/template';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface Announcement {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  announcementType: string;
  isPinned: boolean;
  isImportant: boolean;
  publishedAt: string | null;
}

async function fetchAnnouncements(limit: number) {
  try {
    const res = await fetch(`${API_BASE}/public/announcements?limit=${limit}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? data ?? [];
  } catch {
    return [];
  }
}

function getTypeVariant(type: string): 'warning' | 'error' | 'info' | 'default' {
  const t = type?.toLowerCase();
  if (t === 'alert' || t === 'urgent') return 'error';
  if (t === 'notice') return 'warning';
  if (t === 'circular' || t === 'order') return 'info';
  return 'default';
}

export async function AnnouncementListModule({ config, moduleKey, theme }: ModuleComponentProps) {
  const limit = Number(config?.limit) || 5;
  const showTitle = config?.showTitle !== false;
  const displayTitle = (config?.displayTitle as string) || 'Announcements';
  const tickerMode = config?.tickerMode === true;
  const announcements: Announcement[] = await fetchAnnouncements(limit);

  if (announcements.length === 0) return null;

  // Ticker mode — horizontal scrolling notice strip
  if (tickerMode) {
    return (
      <div
        data-module={moduleKey}
        data-module-type="ANNOUNCEMENT_LIST"
        className="overflow-hidden"
        style={{
          backgroundColor: 'var(--public-primary)',
          color: 'var(--public-text-inverse)',
          padding: '8px 0',
        }}
      >
        <div className="mx-auto max-w-[var(--public-container-width)] flex items-center gap-4 px-4">
          <span
            className="shrink-0 rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
            style={{ backgroundColor: 'var(--public-accent)' }}
          >
            {displayTitle}
          </span>
          <div className="overflow-hidden flex-1">
            <div className="flex gap-8 text-sm whitespace-nowrap overflow-x-auto scrollbar-none">
              {announcements.map((ann) => (
                <Link
                  key={ann.id}
                  href={`/announcements/${ann.slug}`}
                  className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
                >
                  {ann.isImportant && '🔴 '}{ann.isPinned && '📌 '}{ann.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      backgroundVariant="surface"
      spacingVariant="md"
      id={`module-${moduleKey}`}
    >
      <div className="space-y-2" data-module-type="ANNOUNCEMENT_LIST">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="flex items-start gap-3 rounded-[var(--public-radius)] border border-[var(--public-border)] bg-[var(--public-background)] p-3 hover:shadow-[var(--public-shadow-sm)] transition-shadow"
          >
            {/* Importance indicator */}
            {ann.isImportant && (
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: 'var(--public-error)' }}
                aria-label="Important"
              />
            )}
            {ann.isPinned && !ann.isImportant && (
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: 'var(--public-accent)' }}
                aria-label="Pinned"
              />
            )}
            <div className="min-w-0 flex-1">
              <Link
                href={`/announcements/${ann.slug}`}
                className="block text-sm font-medium text-[var(--public-text)] hover:text-[var(--public-primary)] hover:underline underline-offset-2 truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
              >
                {ann.title}
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <PublicBadge variant={getTypeVariant(ann.announcementType)}>
                  {ann.announcementType}
                </PublicBadge>
                {ann.publishedAt && (
                  <span className="text-xs text-[var(--public-text-muted)]">
                    {new Date(ann.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Link
          href="/announcements"
          className="text-sm font-medium text-[var(--public-primary)] hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
        >
          View all announcements →
        </Link>
      </div>
    </PublicSection>
  );
}
