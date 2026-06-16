import Link from 'next/link';
import { PublicSection } from '@/design-system/components/PublicSection';
import { PublicButton } from '@/design-system/components/PublicButton';
import type { ModuleComponentProps } from '@/types/template';

const RTI_SECTIONS = [
  { label: 'Organisational Structure', href: '/rti/structure' },
  { label: 'Powers and Duties of Officers', href: '/rti/duties' },
  { label: 'Rules, Regulations and Instructions', href: '/rti/rules' },
  { label: 'Directory of Officers', href: '/rti/directory' },
  { label: 'Monthly Remuneration', href: '/rti/remuneration' },
  { label: 'Budget and Expenditure', href: '/rti/budget' },
  { label: 'Public Procurement', href: '/rti/procurement' },
  { label: 'Subsidies Programmes', href: '/rti/subsidies' },
  { label: 'Annual Report', href: '/rti/annual-report' },
  { label: 'Proactive Disclosure', href: '/rti/proactive-disclosure' },
];

/** RTIDisclosureModule — Section 4 RTI Act public disclosure. */
export function RTIDisclosureModule({ config, moduleKey }: ModuleComponentProps) {
  const showTitle = config?.showTitle !== false;
  const displayTitle = (config?.displayTitle as string) || 'RTI / Public Disclosure';
  const displayMode = (config?.displayMode as string) || 'list';

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      subtitle="Right to Information"
      backgroundVariant="surface"
      spacingVariant="md"
      id={`module-${moduleKey}`}
    >
      <div data-module={moduleKey} data-module-type="RTI_DISCLOSURE">
        {displayMode === 'compact' ? (
          <div className="flex flex-wrap gap-2">
            {RTI_SECTIONS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="rounded-[var(--public-radius)] border border-[var(--public-border)] bg-[var(--public-background)] px-3 py-2 text-xs font-medium text-[var(--public-text)] hover:border-[var(--public-primary)] hover:text-[var(--public-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
              >
                {s.label}
              </Link>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-[var(--public-border)] rounded-[var(--public-radius)] border border-[var(--public-border)]">
            {RTI_SECTIONS.map((s, idx) => (
              <div
                key={s.href}
                className="flex items-center justify-between bg-[var(--public-background)] px-4 py-3 hover:bg-[var(--public-surface)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[var(--public-text-inverse)]" style={{ backgroundColor: 'var(--public-primary)' }}>
                    {idx + 1}
                  </span>
                  <span className="text-sm text-[var(--public-text)]">{s.label}</span>
                </div>
                <Link
                  href={s.href}
                  className="text-xs font-medium text-[var(--public-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 text-center">
          <Link href="/rti">
            <PublicButton variant="outline" size="sm">RTI Portal</PublicButton>
          </Link>
        </div>
      </div>
    </PublicSection>
  );
}
