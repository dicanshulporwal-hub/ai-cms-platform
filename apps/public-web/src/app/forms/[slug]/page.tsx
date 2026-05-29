import type { Metadata } from 'next';
import { FormEmbedModule } from '@/components/modules/form-embed';

export const metadata: Metadata = {
  title: 'Form',
};

interface FormsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function FormsPage({ params }: FormsPageProps) {
  const { slug } = await params;

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <FormEmbedModule config={{ slug }} moduleKey={`form-${slug}`} />
    </section>
  );
}
