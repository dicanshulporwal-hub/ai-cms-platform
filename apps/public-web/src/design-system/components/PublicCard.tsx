import type { ReactNode } from 'react';

type CardVariant = 'flat' | 'bordered' | 'elevated' | 'government';

interface PublicCardProps {
  variant?: CardVariant;
  header?: ReactNode;
  footer?: ReactNode;
  image?: { src: string; alt: string };
  badge?: ReactNode;
  cta?: ReactNode;
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

const variantClasses: Record<CardVariant, string> = {
  flat: 'bg-[var(--public-surface)]',
  bordered: 'bg-[var(--public-background)] border border-[var(--public-border)]',
  elevated: 'bg-[var(--public-background)] shadow-[var(--public-shadow-card)]',
  government:
    'bg-[var(--public-background)] border border-[var(--public-border)] border-t-4 border-t-[var(--public-primary)]',
};

/** PublicCard — reusable content card with optional header, footer, image, badge, CTA. */
export function PublicCard({
  variant = 'bordered',
  header,
  footer,
  image,
  badge,
  cta,
  className = '',
  children,
  style,
}: PublicCardProps) {
  return (
    <article
      className={[
        'rounded-[var(--public-radius)] overflow-hidden transition-shadow hover:shadow-[var(--public-shadow-md)]',
        variantClasses[variant],
        className,
      ].join(' ')}
      style={style}
    >
      {image && (
        <div className="relative overflow-hidden">
          <img
            src={image.src}
            alt={image.alt}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
          {badge && <div className="absolute top-3 left-3">{badge}</div>}
        </div>
      )}
      {!image && badge && <div className="px-4 pt-4">{badge}</div>}
      {header && (
        <div className="px-4 pt-4 pb-1 font-semibold text-[var(--public-text)]">{header}</div>
      )}
      <div className="px-4 py-3 text-[var(--public-text-muted)]">{children}</div>
      {cta && <div className="px-4 pb-4">{cta}</div>}
      {footer && (
        <div className="border-t border-[var(--public-border)] px-4 py-3 text-sm text-[var(--public-text-muted)]">
          {footer}
        </div>
      )}
    </article>
  );
}
