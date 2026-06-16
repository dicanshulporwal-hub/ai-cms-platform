interface PublicStatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: string;
  className?: string;
}

/** PublicStatCard — statistics counter card for homepage metrics section. */
export function PublicStatCard({ label, value, description, icon, className = '' }: PublicStatCardProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center rounded-[var(--public-radius)] border border-[var(--public-border)] bg-[var(--public-background)] p-6 text-center shadow-[var(--public-shadow-sm)]',
        className,
      ].join(' ')}
    >
      {icon && (
        <span className="mb-2 text-3xl" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="text-3xl font-bold text-[var(--public-primary)]">{value}</span>
      <span className="mt-1 text-sm font-semibold text-[var(--public-text)]">{label}</span>
      {description && (
        <span className="mt-1 text-xs text-[var(--public-text-muted)]">{description}</span>
      )}
    </div>
  );
}
