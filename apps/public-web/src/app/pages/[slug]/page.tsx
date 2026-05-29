import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPageBySlug } from '@/lib/api-client';
import { generateContentMetadata } from '@/lib/metadata';
import { sanitizeHtml } from '@/lib/sanitize-html';

interface PageDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPageBySlug(slug);
  return generateContentMetadata(page, 'Page Not Found');
}

export default async function PageDetailPage({ params }: PageDetailProps) {
  const { slug } = await params;
  const page = await fetchPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold md:text-4xl">{page.title}</h1>

      {page.featuredImage && (
        <div className="mt-6">
          <img
            src={page.featuredImage}
            alt={page.title}
            className="h-auto w-full rounded-lg object-cover"
            loading="eager"
          />
        </div>
      )}

      {page.content && (
        <div
          className="prose prose-lg mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
        />
      )}
    </article>
  );
}
