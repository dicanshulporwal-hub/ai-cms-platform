'use client';

interface PublicPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** PublicPagination — accessible pagination for list modules. */
export function PublicPagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PublicPaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <nav aria-label="Pagination" className={['mt-8 flex items-center justify-center gap-1', className].join(' ')}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-[var(--public-radius)] border border-[var(--public-border)] text-sm text-[var(--public-text-muted)] hover:bg-[var(--public-surface)] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
      >
        ‹
      </button>
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={idx} className="flex h-9 w-9 items-center justify-center text-[var(--public-text-muted)]">
            …
          </span>
        ) : (
          <button
            key={idx}
            onClick={() => onPageChange(page as number)}
            aria-current={page === currentPage ? 'page' : undefined}
            aria-label={`Page ${page}`}
            className={[
              'flex h-9 w-9 items-center justify-center rounded-[var(--public-radius)] text-sm border transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]',
              page === currentPage
                ? 'bg-[var(--public-primary)] text-[var(--public-text-inverse)] border-[var(--public-primary)] font-semibold'
                : 'border-[var(--public-border)] text-[var(--public-text-muted)] hover:bg-[var(--public-surface)]',
            ].join(' ')}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-[var(--public-radius)] border border-[var(--public-border)] text-sm text-[var(--public-text-muted)] hover:bg-[var(--public-surface)] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
      >
        ›
      </button>
    </nav>
  );
}
