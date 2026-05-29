'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import type { ModuleComponentProps } from '@/types/template';
import type { SearchResult } from '@/types/content';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

const TYPE_LABELS: Record<SearchResult['type'], string> = {
  PAGE: 'Page',
  BLOG: 'Blog',
  DOCUMENT: 'Document',
  FAQ: 'FAQ',
};

const TYPE_LINKS: Record<SearchResult['type'], (slug: string) => string> = {
  PAGE: (slug) => `/pages/${slug}`,
  BLOG: (slug) => `/blog/${slug}`,
  DOCUMENT: (slug) => `/documents#${slug}`,
  FAQ: (slug) => `/faqs#${slug}`,
};

export function SearchModule({ config, moduleKey }: ModuleComponentProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.results ?? []);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div data-module={moduleKey} data-module-type="SEARCH" role="search" className="mx-auto max-w-2xl px-4 py-6">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <label htmlFor={`search-input-${moduleKey}`} className="sr-only">
          Search content
        </label>
        <input
          id={`search-input-${moduleKey}`}
          type="search"
          placeholder="Search content..."
          aria-label="Search content"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm shadow-soft transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 focus:shadow-soft-lg"
        />
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching...
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="mt-4 text-center text-sm text-muted-foreground" aria-live="polite">
          No results found for &ldquo;{query}&rdquo;
        </div>
      )}

      {results.length > 0 && (
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-soft" aria-label="Search results">
          {results.map((result) => (
            <li key={result.id}>
              <a
                href={TYPE_LINKS[result.type](result.slug)}
                className="block px-4 py-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {TYPE_LABELS[result.type]}
                  </span>
                  <span className="font-medium text-card-foreground">
                    {result.title}
                  </span>
                </span>
                {result.excerpt && (
                  <span className="mt-1 block text-sm text-muted-foreground line-clamp-2">
                    {result.excerpt}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
