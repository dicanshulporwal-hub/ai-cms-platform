'use client';

import { useState, useEffect } from 'react';
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
    <div data-module={moduleKey} data-module-type="SEARCH" role="search">
      <label htmlFor={`search-input-${moduleKey}`} className="sr-only">
        Search content
      </label>
      <input
        id={`search-input-${moduleKey}`}
        type="search"
        placeholder="Search..."
        aria-label="Search content"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />

      {loading && (
        <div className="mt-2 text-sm text-gray-500" aria-live="polite">
          Searching...
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="mt-2 text-sm text-gray-500" aria-live="polite">
          No results found
        </div>
      )}

      {results.length > 0 && (
        <ul className="mt-2 divide-y divide-gray-100" aria-label="Search results">
          {results.map((result) => (
            <li key={result.id} className="py-2">
              <a
                href={TYPE_LINKS[result.type](result.slug)}
                className="block hover:bg-gray-50 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <span className="flex items-center gap-2">
                  <span className="inline-block rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {TYPE_LABELS[result.type]}
                  </span>
                  <span className="font-medium text-gray-900">
                    {result.title}
                  </span>
                </span>
                {result.excerpt && (
                  <span className="mt-1 block text-sm text-gray-600 line-clamp-2">
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
