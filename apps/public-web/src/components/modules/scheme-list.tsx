import Link from 'next/link';
import type { ModuleComponentProps } from '@/types/template';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface SchemeItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  type: string;
  applicationMode: string;
  category: { name: string } | null;
}

async function fetchSchemes(limit: number, type?: string) {
  try {
    const url = type === 'SERVICE'
      ? `${API_BASE}/public/services?limit=${limit}`
      : `${API_BASE}/public/schemes?limit=${limit}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch { return []; }
}

export async function SchemeListModule({ config, theme }: ModuleComponentProps) {
  const limit = (config?.limit as number) || 6;
  const type = (config?.type as string) || 'SCHEME';
  const items: SchemeItem[] = await fetchSchemes(limit, type);

  if (items.length === 0) return null;

  const heading = type === 'SERVICE' ? 'Citizen Services' : 'Government Schemes';

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold mb-4" style={{ color: theme?.primaryColor }}>
        {heading}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={type === 'SERVICE' ? `/services/${item.slug}` : `/schemes/${item.slug}`}
            className="block rounded-lg border bg-white p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${item.type === 'SERVICE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {item.type}
              </span>
              {item.applicationMode !== 'NOT_APPLICABLE' && (
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-50 text-green-700">{item.applicationMode}</span>
              )}
            </div>
            <h3 className="font-medium text-sm">{item.title}</h3>
            {item.summary && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.summary}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
