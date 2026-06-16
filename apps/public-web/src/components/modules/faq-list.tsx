import { PublicSection } from '@/design-system/components/PublicSection';
import { PublicAccordion } from '@/design-system/components/PublicAccordion';
import type { ModuleComponentProps } from '@/types/template';
import { fetchFaqs } from '@/lib/api-client';

export async function FaqListModule({ config, moduleKey }: ModuleComponentProps) {
  const faqs = await fetchFaqs();
  const showTitle = config?.showTitle !== false;
  const displayTitle = (config?.displayTitle as string) || 'Frequently Asked Questions';
  const displayMode = (config?.displayMode as string) || 'accordion';

  if (!faqs || faqs.length === 0) return null;

  const items = faqs.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      layoutVariant="contained"
      spacingVariant="md"
      id={`module-${moduleKey}`}
    >
      <div
        data-module={moduleKey}
        data-module-type="FAQ_LIST"
        className="mx-auto max-w-3xl"
      >
        {displayMode === 'accordion' ? (
          <PublicAccordion items={items} allowMultiple />
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="rounded-[var(--public-radius)] border border-[var(--public-border)] p-4">
                <h3 className="text-sm font-semibold text-[var(--public-text)]">{item.question}</h3>
                <div className="mt-2 text-sm text-[var(--public-text-muted)]">{item.answer}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicSection>
  );
}
