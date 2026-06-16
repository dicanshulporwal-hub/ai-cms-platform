import Link from 'next/link';

interface LinkItem {
  label: string;
  href: string;
  external?: boolean;
}

interface PublicLinkListProps {
  items: LinkItem[];
  title?: string;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/** PublicLinkList — footer links, quick links, policy links. */
export function PublicLinkList({
  items,
  title,
  orientation = 'vertical',
  className = '',
}: PublicLinkListProps) {
  return (
    <nav aria-label={title} className={className}>
      {title && (
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--public-text-inverse)] opacity-80">
          {title}
        </h3>
      )}
      <ul
        className={[
          orientation === 'horizontal'
            ? 'flex flex-wrap gap-x-4 gap-y-1'
            : 'flex flex-col gap-1',
        ].join(' ')}
      >
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              className="text-sm text-[var(--public-text-inverse)] opacity-80 hover:opacity-100 hover:underline underline-offset-2 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
            >
              {item.label}
              {item.external && (
                <span className="sr-only"> (opens in new tab)</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
