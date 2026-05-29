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
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            No FAQs available yet. Check back soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Find answers to common questions below
        </p>
      </div>
      <FaqAccordion faqs={faqs} />
    </section>
  );
}
