import Link from 'next/link';
import type { ReactNode } from 'react';

interface PublicFooterProps {
  siteName?: string;
  description?: string;
  logoUrl?: string;
  columnsSlot?: ReactNode;
  lastUpdated?: string;
  visitorCount?: number;
  className?: string;
}

const DEFAULT_POLICY_LINKS = [
  { label: 'Website Policies', href: '/policies' },
  { label: 'Accessibility Statement', href: '/accessibility-statement' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'Help', href: '/help' },
  { label: 'Feedback', href: '/feedback' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Terms of Use', href: '/terms' },
];

/**
 * PublicFooter — government website footer.
 * Includes mandatory GIGW-required policy links.
 * Background uses --public-secondary token.
 */
export function PublicFooter({
  siteName,
  description,
  logoUrl,
  columnsSlot,
  lastUpdated,
  visitorCount,
  className = '',
}: PublicFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={['w-full', className].join(' ')}
      style={{ backgroundColor: 'var(--public-secondary)', color: 'var(--public-text-inverse)' }}
    >
      {/* Main footer body */}
      <div className="mx-auto max-w-[var(--public-container-width)] px-4 py-8 sm:px-6 lg:px-8">
        {/* Site identity row */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={siteName ?? 'Site Logo'}
              className="h-10 w-auto object-contain opacity-90"
              loading="lazy"
            />
          )}
          <div>
            {siteName && (
              <p className="text-base font-bold opacity-90">{siteName}</p>
            )}
            {description && (
              <p className="mt-1 max-w-md text-xs opacity-70">{description}</p>
            )}
          </div>
        </div>

        {/* Column links slot */}
        {columnsSlot && <div className="mb-6">{columnsSlot}</div>}

        <hr className="border-white/20 mb-4" />

        {/* Mandatory GIGW policy links */}
        <nav aria-label="Website policies">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {DEFAULT_POLICY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs text-white/70 hover:text-white hover:underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t border-white/10 py-3"
        style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
      >
        <div className="mx-auto flex max-w-[var(--public-container-width)] flex-wrap items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-white/60">
            © {year} {siteName ?? 'Government of India'}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/60">
            {lastUpdated && <span>Last Updated: {lastUpdated}</span>}
            {visitorCount !== undefined && (
              <span>Visitors: {visitorCount.toLocaleString('en-IN')}</span>
            )}
            <span className="text-white/40">
              GIGW-Readiness aligned · UX4G-compatible layout
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
