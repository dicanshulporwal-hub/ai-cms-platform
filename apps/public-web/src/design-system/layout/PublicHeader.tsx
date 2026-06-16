import type { ReactNode } from 'react';

interface PublicHeaderProps {
  emblemUrl?: string;
  logoUrl?: string;
  siteName?: string;
  tagline?: string;
  searchSlot?: ReactNode;
  actionsSlot?: ReactNode;
  className?: string;
}

/**
 * PublicHeader — government website header with emblem, logo, site name, tagline, search.
 * Background uses --public-primary token.
 */
export function PublicHeader({
  emblemUrl,
  logoUrl,
  siteName,
  tagline,
  searchSlot,
  actionsSlot,
  className = '',
}: PublicHeaderProps) {
  return (
    <header
      className={['w-full', className].join(' ')}
      style={{
        backgroundColor: 'var(--public-primary)',
        color: 'var(--public-text-inverse)',
        minHeight: 'var(--public-header-height)',
      }}
    >
      <div className="mx-auto flex max-w-[var(--public-container-width)] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Emblem / Logo */}
        <div className="flex shrink-0 items-center gap-3">
          {emblemUrl && (
            <img
              src={emblemUrl}
              alt="Government Emblem"
              className="h-12 w-auto object-contain"
              loading="eager"
            />
          )}
          {logoUrl && (
            <img
              src={logoUrl}
              alt={siteName ?? 'Site Logo'}
              className="h-10 w-auto object-contain"
              loading="eager"
            />
          )}
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1">
          {siteName && (
            <p className="truncate text-lg font-bold leading-tight">{siteName}</p>
          )}
          {tagline && (
            <p className="truncate text-xs opacity-80">{tagline}</p>
          )}
        </div>

        {/* Search & Actions */}
        {(searchSlot || actionsSlot) && (
          <div className="flex shrink-0 items-center gap-3">
            {searchSlot}
            {actionsSlot}
          </div>
        )}
      </div>
    </header>
  );
}
