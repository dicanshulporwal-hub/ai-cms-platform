'use client';

import { useState, useId } from 'react';
import type { ReactNode } from 'react';

interface AccordionItem {
  id?: string;
  question: string;
  answer: ReactNode;
}

interface PublicAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

/** PublicAccordion — keyboard-accessible FAQ/disclosure accordion. */
export function PublicAccordion({ items, allowMultiple = false, className = '' }: PublicAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());
  const uid = useId();

  function toggle(idx: number) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        if (!allowMultiple) next.clear();
        next.add(idx);
      }
      return next;
    });
  }

  return (
    <div className={['divide-y divide-[var(--public-border)] rounded-[var(--public-radius)] border border-[var(--public-border)]', className].join(' ')}>
      {items.map((item, idx) => {
        const isOpen = openIds.has(idx);
        const headingId = `${uid}-heading-${idx}`;
        const panelId = `${uid}-panel-${idx}`;
        return (
          <div key={idx}>
            <h3 className="m-0">
              <button
                id={headingId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(idx)}
                className={[
                  'flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-medium transition-colors',
                  'text-[var(--public-text)] hover:bg-[var(--public-surface)]',
                  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-[var(--public-focus-ring)]',
                  isOpen ? 'bg-[var(--public-surface)]' : '',
                ].join(' ')}
              >
                <span className="flex-1">{item.question}</span>
                <span className={['shrink-0 text-[var(--public-primary)] transition-transform duration-200', isOpen ? 'rotate-180' : ''].join(' ')} aria-hidden="true">
                  ▾
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              hidden={!isOpen}
              className="px-4 pb-4 pt-2 text-sm text-[var(--public-text-muted)] leading-relaxed"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
