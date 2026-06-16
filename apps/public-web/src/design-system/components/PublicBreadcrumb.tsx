import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PublicBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/** PublicBreadcrumb — accessible navigation breadcrumb with schema.org support. */
export function PublicBreadcrumb({ items, className = '' }: PublicBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        className="flex flex-wrap items-center gap-1 text-xs text-[var(--public-text-muted)]"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li
              key={idx}
              className="flex items-center gap-1"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={String(idx + 1)} />
              {!isLast && item.href ? (
                <Link
                  href={item.href}
                  itemProp="item"
                  className="hover:text-[var(--public-primary)] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span
                  className={isLast ? 'text-[var(--public-text)] font-medium' : ''}
                  aria-current={isLast ? 'page' : undefined}
                  itemProp="name"
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="text-[var(--public-border-strong)]" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
