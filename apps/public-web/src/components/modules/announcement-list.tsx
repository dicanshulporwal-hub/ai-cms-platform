import Link from 'next/link';
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
    const res = await fetch(`${API_BASE}/public/announcements?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch { return []; }
}

export async function AnnouncementListModule({ config, theme }: ModuleComponentProps) {
  const limit = (config?.limit as number) || 5;
  const announcements: Announcement[] = await fetchAnnouncements(limit);

  if (announcements.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold mb-4" style={{ color: theme?.primaryColor }}>
        Latest Announcements
      </h2>
      <div className="space-y-2">
        {announcements.map((ann) => (
          <div key={ann.id} className="flex items-start gap-3 rounded-lg border bg-white p-3 hover:shadow-sm transition-shadow">
            {ann.isImportant && <span className="mt-0.5 h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />}
            {ann.isPinned && !ann.isImportant && <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{ann.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{ann.announcementType}</span>
                {ann.publishedAt && <span className="text-xs text-gray-500">{new Date(ann.publishedAt).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
