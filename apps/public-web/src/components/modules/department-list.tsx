import Link from 'next/link';
import { PublicSection } from '@/design-system/components/PublicSection';
import { PublicGrid } from '@/design-system/components/PublicGrid';
import { PublicCard } from '@/design-system/components/PublicCard';
import type { ModuleComponentProps } from '@/types/template';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface Department {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
}

async function fetchDepartments(limit: number) {
  try {
    const res = await fetch(`${API_BASE}/public/departments?limit=${limit}`, {
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

export async function DepartmentListModule({ config, moduleKey }: ModuleComponentProps) {
  const limit = Number(config?.limit) || 6;
  const showTitle = config?.showTitle !== false;
  const displayTitle = (config?.displayTitle as string) || 'Departments';

  const departments: Department[] = await fetchDepartments(limit);
  if (departments.length === 0) return null;

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      spacingVariant="md"
      id={`module-${moduleKey}`}
      actionLink={
        <Link href="/contact-directory/departments" className="text-sm font-medium text-[var(--public-primary)] hover:underline">
          All departments →
        </Link>
      }
    >
      <div data-module={moduleKey} data-module-type="DEPARTMENT_LIST">
        <PublicGrid cols={3} gap="md">
          {departments.map((dept) => (
            <PublicCard key={dept.id} variant="government">
              <h3 className="text-sm font-semibold text-[var(--public-text)]">{dept.name}</h3>
              {dept.description && (
                <p className="mt-1 text-xs text-[var(--public-text-muted)] line-clamp-2">{dept.description}</p>
              )}
              {(dept.phone || dept.email) && (
                <div className="mt-2 text-xs text-[var(--public-text-muted)] space-y-0.5">
                  {dept.phone && <div>📞 {dept.phone}</div>}
                  {dept.email && (
                    <div>
                      ✉{' '}
                      <a href={`mailto:${dept.email}`} className="hover:text-[var(--public-primary)] hover:underline">
                        {dept.email}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </PublicCard>
          ))}
        </PublicGrid>
      </div>
    </PublicSection>
  );
}
