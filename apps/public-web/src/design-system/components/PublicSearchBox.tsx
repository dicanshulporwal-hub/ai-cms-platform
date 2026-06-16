'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface PublicSearchBoxProps {
  placeholder?: string;
  searchPath?: string;
  className?: string;
  inputClassName?: string;
  compact?: boolean;
}

/** PublicSearchBox — accessible site-wide search input. Navigates to /search?q=... */
export function PublicSearchBox({
  placeholder = 'Search the portal...',
  searchPath = '/search',
  className = '',
  inputClassName = '',
  compact = false,
}: PublicSearchBoxProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`${searchPath}?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={['flex', className].join(' ')}
      aria-label="Site search"
    >
      <label htmlFor="public-search-input" className="sr-only">
        Search
      </label>
      <input
        id="public-search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={[
          'min-w-0 flex-1 rounded-l-[var(--public-radius)] border border-r-0 border-[var(--public-border)] bg-white px-3 text-sm text-[var(--public-text)] placeholder:text-[var(--public-text-muted)]',
          'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--public-accent)]',
          compact ? 'py-1.5 text-xs' : 'py-2',
          inputClassName,
        ].join(' ')}
      />
      <button
        type="submit"
        aria-label="Submit search"
        className={[
          'shrink-0 rounded-r-[var(--public-radius)] bg-[var(--public-primary)] px-4 text-white transition-colors hover:bg-[var(--public-primary-hover)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]',
          compact ? 'py-1.5 text-xs' : 'py-2 text-sm',
        ].join(' ')}
      >
        🔍
      </button>
    </form>
  );
}
