import Link from 'next/link';
import { PublicSection } from '@/design-system/components/PublicSection';
import { PublicCard } from '@/design-system/components/PublicCard';
import { PublicBadge } from '@/design-system/components/PublicBadge';
import { PublicGrid } from '@/design-system/components/PublicGrid';
import { PublicButton } from '@/design-system/components/PublicButton';
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

async function fetchSchemes(limit: number, moduleType: string) {
  try {
    const url =
      moduleType === 'SERVICE_LIST'
        ? `${API_BASE}/public/services?limit=${limit}`
        : `${API_BASE}/public/schemes?limit=${limit}`;
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function SchemeListModule({ config, moduleKey }: ModuleComponentProps) {
  const limit = Number(config?.limit) || 6;
  const showTitle = config?.showTitle !== false;
  const isService = moduleKey?.toLowerCase().includes('service') || (config as any)?._moduleType === 'SERVICE_LIST';
  const displayTitle = (config?.displayTitle as string) || (isService ? 'Citizen Services' : 'Government Schemes');
  const showApplyButton = config?.showApplyButton !== false;
  const displayMode = (config?.displayMode as string) || 'cards';
  const listPath = isService ? '/services' : '/schemes';

  const items: SchemeItem[] = await fetchSchemes(limit, isService ? 'SERVICE_LIST' : 'SCHEME_LIST');
  if (items.length === 0) return null;

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      spacingVariant="md"
      id={`module-${moduleKey}`}
      actionLink={
        <Link href={listPath} className="text-sm font-medium text-[var(--public-primary)] hover:underline">
          View all →
        </Link>
      }
    >
      <div data-module-type="SCHEME_LIST">
        <PublicGrid cols={3} gap="md">
          {items.map((item) => (
            <PublicCard
              key={item.id}
              variant="government"
              badge={
                <PublicBadge variant={item.type === 'SERVICE' ? 'info' : 'new'}>
                  {item.type}
                </PublicBadge>
              }
              header={
                <Link
                  href={`${listPath}/${item.slug}`}
                  className="hover:text-[var(--public-primary)] hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
                >
                  {item.title}
                </Link>
              }
              cta={
                showApplyButton ? (
                  <Link href={`${listPath}/${item.slug}`} tabIndex={-1} aria-hidden="true">
                    <PublicButton variant="outline" size="sm" className="w-full">
                      {isService ? 'Access Service' : 'Know More'}
                    </PublicButton>
                  </Link>
                ) : undefined
              }
              footer={
                item.category ? (
                  <span className="text-xs text-[var(--public-text-muted)]">{item.category.name}</span>
                ) : undefined
              }
            >
              {item.summary && (
                <p className="text-sm text-[var(--public-text-muted)] line-clamp-2">{item.summary}</p>
              )}
              {item.applicationMode && item.applicationMode !== 'NOT_APPLICABLE' && (
                <div className="mt-2">
                  <PublicBadge variant="success">{item.applicationMode}</PublicBadge>
                </div>
              )}
            </PublicCard>
          ))}
        </PublicGrid>
      </div>
    </PublicSection>
  );
}
