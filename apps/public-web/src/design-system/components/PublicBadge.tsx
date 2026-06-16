import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'new' | 'important';

interface PublicBadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--public-surface)] text-[var(--public-text-muted)] border-[var(--public-border)]',
  success: 'bg-[var(--public-success-light)] text-[var(--public-success)] border-[var(--public-success)]',
  warning: 'bg-[var(--public-warning-light)] text-[var(--public-warning)] border-[var(--public-warning)]',
  error: 'bg-[var(--public-error-light)] text-[var(--public-error)] border-[var(--public-error)]',
  info: 'bg-[var(--public-info-light)] text-[var(--public-info)] border-[var(--public-info)]',
  new: 'bg-[var(--public-primary-light)] text-[var(--public-primary)] border-[var(--public-primary)]',
  important: 'bg-orange-50 text-orange-700 border-orange-300',
};

/** PublicBadge — compact label for status, categories, tags. */
export function PublicBadge({ variant = 'default', children, className = '' }: PublicBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
