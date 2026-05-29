import type { ModuleComponentProps } from '@/types/template';
import { fetchFaqs } from '@/lib/api-client';
import { FaqAccordion } from './faq-accordion';

export async function FaqListModule({ config, moduleKey }: ModuleComponentProps) {
  const faqs = await fetchFaqs();

  return (
    <section data-module={moduleKey} data-module-type="FAQ_LIST" aria-label="Frequently Asked Questions">
      <h2>Frequently Asked Questions</h2>
      <FaqAccordion faqs={faqs ?? []} />
    </section>
  );
}
