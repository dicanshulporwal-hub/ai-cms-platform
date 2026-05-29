import type { Metadata } from 'next';
import { fetchFaqs } from '@/lib/api-client';
import { FaqAccordion } from '@/components/modules/faq-accordion';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
};

export default async function FaqsPage() {
  const faqs = await fetchFaqs();

  if (!faqs || faqs.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Frequently Asked Questions</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          No FAQs available.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Frequently Asked Questions</h1>
      <div className="mt-8">
        <FaqAccordion faqs={faqs} />
      </div>
    </section>
  );
}
