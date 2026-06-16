import Link from 'next/link';
import { PublicSection } from '@/design-system/components/PublicSection';
import { PublicBadge } from '@/design-system/components/PublicBadge';
import { PublicTable } from '@/design-system/components/PublicTable';
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
  hasCorrigendum?: boolean;
}

async function fetchTenders(limit: number, activeOnly: boolean) {
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (activeOnly) params.set('status', 'ACTIVE');
    const res = await fetch(`${API_BASE}/public/tenders?${params}`, {
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

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export async function TenderListModule({ config, moduleKey }: ModuleComponentProps) {
  const limit = Number(config?.limit) || 5;
  const showTitle = config?.showTitle !== false;
  const displayTitle = (config?.displayTitle as string) || 'Tenders & Procurement';
  const showActiveOnly = config?.showActiveOnly !== false;
  const showClosingDate = config?.showClosingDate !== false;
  const showCorrigendumBadge = config?.showCorrigendumBadge !== false;
  const displayMode = (config?.displayMode as string) || 'table';

  const tenders: Tender[] = await fetchTenders(limit, showActiveOnly);
  if (tenders.length === 0) return null;

  const columns = [
    {
      key: 'title',
      header: 'Tender Title',
      render: (_: unknown, row: Record<string, unknown>) => {
        const t = row as unknown as Tender;
        return (
          <div>
            <Link
              href={`/tenders/${t.slug}`}
              className="text-sm font-medium text-[var(--public-link)] hover:underline underline-offset-2"
            >
              {t.title}
            </Link>
            {showCorrigendumBadge && t.hasCorrigendum && (
              <PublicBadge variant="warning" className="ml-2">Corrigendum</PublicBadge>
            )}
          </div>
        );
      },
    },
    { key: 'tenderNumber', header: 'Tender No.' },
    ...(showClosingDate
      ? [{
          key: 'closingDate',
          header: 'Closing Date',
          render: (v: unknown) => {
            if (!v) return <span className="text-[var(--public-text-muted)]">—</span>;
            const days = daysUntil(v as string);
            return (
              <div>
                <span className="text-sm">{new Date(v as string).toLocaleDateString('en-IN')}</span>
                {days >= 0 && days <= 3 && (
                  <PublicBadge variant="error" className="ml-2">Closing soon</PublicBadge>
                )}
              </div>
            );
          },
        }]
      : []),
    {
      key: 'status',
      header: 'Status',
      render: (v: unknown) => (
        <PublicBadge variant={String(v) === 'ACTIVE' ? 'success' : 'default'}>
          {String(v ?? '—')}
        </PublicBadge>
      ),
    },
  ];

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      backgroundVariant="default"
      spacingVariant="md"
      id={`module-${moduleKey}`}
      actionLink={
        <Link
          href="/tenders"
          className="text-sm font-medium text-[var(--public-primary)] hover:underline"
        >
          View all tenders →
        </Link>
      }
    >
      <div data-module-type="TENDER_LIST">
        {displayMode === 'table' ? (
          <PublicTable
            columns={columns}
            rows={tenders as unknown as Record<string, unknown>[]}
            emptyMessage="No active tenders at this time."
            caption="Tenders and Procurement"
          />
        ) : (
          <div className="space-y-3">
            {tenders.map((t) => (
              <div
                key={t.id}
                className="rounded-[var(--public-radius)] border border-[var(--public-border)] bg-[var(--public-background)] p-4 hover:shadow-[var(--public-shadow-sm)] transition-shadow"
              >
                <Link
                  href={`/tenders/${t.slug}`}
                  className="text-sm font-semibold text-[var(--public-link)] hover:underline"
                >
                  {t.title}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--public-text-muted)]">
                  {t.tenderNumber && <span>No: {t.tenderNumber}</span>}
                  {t.closingDate && showClosingDate && (
                    <span>Closes: {new Date(t.closingDate).toLocaleDateString('en-IN')}</span>
                  )}
                  <PublicBadge variant={t.status === 'ACTIVE' ? 'success' : 'default'}>
                    {t.status}
                  </PublicBadge>
                  {showCorrigendumBadge && t.hasCorrigendum && (
                    <PublicBadge variant="warning">Corrigendum</PublicBadge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicSection>
  );
}
