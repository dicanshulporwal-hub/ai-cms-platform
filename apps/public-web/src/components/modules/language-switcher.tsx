'use client';

import { useState } from 'react';
import type { ModuleComponentProps } from '@/types/template';

interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
}

const DEFAULT_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
];

/** LanguageSwitcherModule — public language switcher for government sites. */
export function LanguageSwitcherModule({ config, moduleKey }: ModuleComponentProps) {
  const languages: LanguageOption[] =
    Array.isArray(config?.languages) ? (config.languages as LanguageOption[]) : DEFAULT_LANGUAGES;

  const [current, setCurrent] = useState('en');

  if (languages.length <= 1) return null;

  return (
    <div data-module={moduleKey} data-module-type="LANGUAGE_SWITCHER" className="flex items-center gap-1">
      <span className="text-xs text-white/60 hidden sm:inline mr-1">🌐</span>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setCurrent(lang.code)}
          lang={lang.code}
          aria-current={current === lang.code ? 'true' : undefined}
          aria-label={`Switch to ${lang.label}`}
          className={[
            'px-2 py-0.5 text-xs rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]',
            current === lang.code
              ? 'bg-white/20 border-white/40 text-white font-semibold'
              : 'border-white/20 text-white/70 hover:text-white hover:border-white/40',
          ].join(' ')}
        >
          {lang.nativeLabel}
        </button>
      ))}
    </div>
  );
}
