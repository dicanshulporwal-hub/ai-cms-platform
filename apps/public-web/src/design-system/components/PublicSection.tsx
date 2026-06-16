import type { ReactNode } from 'react';

type BackgroundVariant = 'default' | 'surface' | 'primary' | 'muted' | 'transparent';
type LayoutVariant = 'full' | 'contained';
type SpacingVariant = 'none' | 'sm' | 'md' | 'lg';

interface PublicSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  actionLink?: ReactNode;
  backgroundVariant?: BackgroundVariant;
  layoutVariant?: LayoutVariant;
  spacingVariant?: SpacingVariant;
  id?: string;
  className?: string;
  children: ReactNode;
}

const bgClasses: Record<BackgroundVariant, string> = {
  default: 'bg-[var(--public-background)]',
  surface: 'bg-[var(--public-surface)]',
  primary: 'bg-[var(--public-primary)] text-[var(--public-text-inverse)]',
  muted: 'bg-[var(--public-surface-muted)]',
  transparent: 'bg-transparent',
};

const spacingClasses: Record<SpacingVariant, string> = {
  none: '',
  sm: 'py-6',
  md: 'py-10',
  lg: 'py-[var(--public-section-spacing)]',
};

/**
 * PublicSection — section wrapper with optional heading, subtitle, description, and action link.
 * Used by all module renderers for consistent section layout.
 */
export function PublicSection({
  title,
  subtitle,
  description,
  actionLink,
  backgroundVariant = 'default',
  layoutVariant = 'contained',
  spacingVariant = 'lg',
  id,
  className = '',
  children,
}: PublicSectionProps) {
  return (
    <section
      id={id}
      className={[bgClasses[backgroundVariant], spacingClasses[spacingVariant], className].join(' ')}
    >
      <div
        className={
          layoutVariant === 'contained'
            ? 'mx-auto w-full max-w-[var(--public-container-width)] px-4 sm:px-6 lg:px-8'
            : 'w-full px-4 sm:px-6 lg:px-8'
        }
      >
        {(title || subtitle || description || actionLink) && (
          <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              {subtitle && (
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--public-primary)]">
                  {subtitle}
                </p>
              )}
              {title && (
                <h2 className="text-2xl font-bold leading-tight text-[inherit]">{title}</h2>
              )}
              {description && (
                <p className="mt-1 max-w-2xl text-sm text-[var(--public-text-muted)]">{description}</p>
              )}
            </div>
            {actionLink && <div className="mt-3 sm:mt-0 sm:shrink-0">{actionLink}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
