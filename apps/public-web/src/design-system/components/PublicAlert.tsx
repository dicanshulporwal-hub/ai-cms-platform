import type { ReactNode } from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'notice';

interface PublicAlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const variantConfig: Record<
  AlertVariant,
  { bg: string; border: string; icon: string; iconClass: string }
> = {
  info: { bg: 'bg-[var(--public-info-light)]', border: 'border-[var(--public-info)]', icon: 'ℹ', iconClass: 'text-[var(--public-info)]' },
  success: { bg: 'bg-[var(--public-success-light)]', border: 'border-[var(--public-success)]', icon: '✓', iconClass: 'text-[var(--public-success)]' },
  warning: { bg: 'bg-[var(--public-warning-light)]', border: 'border-[var(--public-warning)]', icon: '⚠', iconClass: 'text-[var(--public-warning)]' },
  error: { bg: 'bg-[var(--public-error-light)]', border: 'border-[var(--public-error)]', icon: '✕', iconClass: 'text-[var(--public-error)]' },
  notice: { bg: 'bg-[var(--public-surface-muted)]', border: 'border-[var(--public-border-strong)]', icon: '📢', iconClass: 'text-[var(--public-text-muted)]' },
};

/** PublicAlert — dismissible notice block for important information. */
export function PublicAlert({ variant = 'info', title, children, className = '' }: PublicAlertProps) {
  const cfg = variantConfig[variant];
  return (
    <div
      className={['flex gap-3 rounded-[var(--public-radius)] border-l-4 p-4', cfg.bg, cfg.border, className].join(' ')}
      role="alert"
    >
      <span className={['mt-0.5 shrink-0 text-lg font-bold', cfg.iconClass].join(' ')} aria-hidden="true">
        {cfg.icon}
      </span>
      <div className="min-w-0 flex-1">
        {title && <p className="mb-1 font-semibold text-[var(--public-text)]">{title}</p>}
        <div className="text-sm text-[var(--public-text-muted)]">{children}</div>
      </div>
    </div>
  );
}
