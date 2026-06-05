import Link from 'next/link';
import type { ModuleComponentProps } from '@/types/template';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface Tender {
  id: string;
  title: string;
  slug: string;
  tenderNumber: string | null;
  status: string;
  closingDate: string | null;
  openingDate: string | null;
}

async function fetchTenders(limit: number) {
  try {
    const res = await fetch(`${API_BASE}/public/tenders?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch { return []; }
}

export async function TenderListModule({ config, theme }: ModuleComponentProps) {
  const limit = (config?.limit as number) || 5;
  const tenders: Tender[] = await fetchTenders(limit);

  if (tenders.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold mb-4" style={{ color: theme?.primaryColor }}>
        Active Tenders
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-2.5 px-3 font-medium text-gray-600">Title</th>
              <th className="text-left py-2.5 px-3 font-medium text-gray-600">Number</th>
              <th className="text-left py-2.5 px-3 font-medium text-gray-600">Closing Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tenders.map((tender) => (
              <tr key={tender.id} className="hover:bg-gray-50">
                <td className="py-2.5 px-3">
                  <Link href={`/tenders/${tender.slug}`} className="text-sm font-medium hover:text-blue-600 transition-colors">
                    {tender.title}
                  </Link>
                </td>
                <td className="py-2.5 px-3 text-xs text-gray-500">{tender.tenderNumber || '-'}</td>
                <td className="py-2.5 px-3 text-xs text-gray-500">
                  {tender.closingDate ? new Date(tender.closingDate).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
