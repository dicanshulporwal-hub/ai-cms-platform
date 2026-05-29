'use client';

import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@/types/content';

interface FaqAccordionProps {
  faqs: FaqItem[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, id: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(id);
      }
    },
    [toggle],
  );

  if (faqs.length === 0) {
    return (
      <p className="text-center text-muted-foreground">No FAQs available.</p>
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border" role="list">
      {faqs.map((faq) => {
        const isExpanded = expandedIds.has(faq.id);
        const buttonId = `faq-button-${faq.id}`;
        const panelId = `faq-panel-${faq.id}`;

        return (
          <div key={faq.id} role="listitem">
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => toggle(faq.id)}
                onKeyDown={(e) => handleKeyDown(e, faq.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium text-foreground transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isExpanded}
              className={`overflow-hidden transition-all duration-200 ${
                isExpanded ? 'pb-5 px-5' : ''
              }`}
            >
              <p className="text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
