import Link from 'next/link';
import { PublicSection } from '@/design-system/components/PublicSection';
import { PublicGrid } from '@/design-system/components/PublicGrid';
import type { ModuleComponentProps } from '@/types/template';

interface QuickLink {
  label: string;
  href: string;
  icon?: string;
  description?: string;
}

const DEFAULT_LINKS: QuickLink[] = [
  { label: 'Schemes & Services', href: '/schemes', icon: '📋', description: 'Government schemes for citizens' },
  { label: 'Tenders', href: '/tenders', icon: '📄', description: 'Active tenders and procurement' },
  { label: 'RTI / Disclosure', href: '/rti', icon: '🔍', description: 'Right to Information' },
  { label: 'Grievance Redressal', href: '/grievances', icon: '📝', description: 'Submit and track grievances' },
  { label: 'Contact Directory', href: '/contact-directory', icon: '📞', description: 'Officers and departments' },
  { label: 'Documents', href: '/documents', icon: '📁', description: 'Official documents and forms' },
];

export function QuickLinksModule({ config, moduleKey }: ModuleComponentProps) {
  const links: QuickLink[] = (config?.links as QuickLink[]) || DEFAULT_LINKS;
  const showTitle = config?.showTitle !== false;
  const displayTitle = (config?.displayTitle as string) || 'Quick Access';
  const limit = Number(config?.limit) || links.length;
  const visible = links.slice(0, limit);
  const cols = Math.min(visible.length, 4) as 2 | 3 | 4;

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      backgroundVariant="default"
      spacingVariant="md"
      id={`module-${moduleKey}`}
    >
      <div data-module-type="QUICK_LINKS">
        <PublicGrid cols={cols} gap="md">
          {visible.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-3 rounded-[var(--public-radius)] border border-[var(--public-border)] bg-[var(--public-background)] p-4 transition-all hover:border-[var(--public-primary)] hover:shadow-[var(--public-shadow-md)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--public-focus-ring)]"
            >
              {link.icon && (
                <span
                  className="shrink-0 flex h-10 w-10 items-center justify-center rounded-[var(--public-radius)] text-xl"
                  style={{ backgroundColor: 'var(--public-primary-light)' }}
                  aria-hidden="true"
                >
                  {link.icon}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--public-text)] group-hover:text-[var(--public-primary)]">
                  {link.label}
                </p>
                {link.description && (
                  <p className="text-xs text-[var(--public-text-muted)] mt-0.5 truncate">
                    {link.description}
                  </p>
                )}
              </div>
              <span
                className="ml-auto shrink-0 text-[var(--public-text-muted)] group-hover:text-[var(--public-primary)]"
                aria-hidden="true"
              >
                ›
              </span>
            </Link>
          ))}
        </PublicGrid>
      </div>
    </PublicSection>
  );
}
