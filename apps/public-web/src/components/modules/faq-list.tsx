import type { ModuleComponentProps } from '@/types/template';
import { fetchFaqs } from '@/lib/api-client';
import { FaqAccordion } from './faq-accordion';

export async function FaqListModule({ config, moduleKey }: ModuleComponentProps) {
  const faqs = await fetchFaqs();

  return (
    <section
      data-module={moduleKey}
      data-module-type="FAQ_LIST"
      aria-label="Frequently Asked Questions"
      className="px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <FaqAccordion faqs={faqs ?? []} />
      </div>
    </section>
  );
}
