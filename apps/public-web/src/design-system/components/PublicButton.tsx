import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface PublicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--public-primary)] text-[var(--public-text-inverse)] hover:bg-[var(--public-primary-hover)] border border-transparent',
  secondary:
    'bg-[var(--public-secondary)] text-[var(--public-text-inverse)] hover:bg-[var(--public-secondary-hover)] border border-transparent',
  outline:
    'bg-transparent text-[var(--public-primary)] border border-[var(--public-primary)] hover:bg-[var(--public-primary-light)]',
  ghost:
    'bg-transparent text-[var(--public-text)] border border-transparent hover:bg-[var(--public-surface)]',
  link: 'bg-transparent text-[var(--public-link)] border-none underline hover:text-[var(--public-link-hover)] p-0',
  danger:
    'bg-[var(--public-error)] text-white border border-transparent hover:opacity-90',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

/**
 * PublicButton — accessible, design-token-driven button for public website.
 * Supports all required variants and sizes. Focus ring uses --public-focus-ring.
 */
export function PublicButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}: PublicButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium rounded-[var(--public-radius)] transition-colors',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--public-focus-ring)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        variant !== 'link' ? sizeClasses[size] : '',
        'min-h-[var(--public-min-touch-target)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-disabled={isDisabled}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
