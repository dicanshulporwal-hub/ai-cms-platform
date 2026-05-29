import type { Metadata } from 'next';
import { fetchPageBySlug } from '@/lib/api-client';
import { generateContentMetadata } from '@/lib/metadata';
import { sanitizeHtml } from '@/lib/sanitize-html';

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageBySlug('home');
  return generateContentMetadata(page, 'Home');
}

export default async function HomePage() {
  const page = await fetchPageBySlug('home');

  if (!page) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Welcome</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Welcome to our website. Content is being prepared and will be available
          soon.
        </p>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      {page.featuredImage && (
        <img
          src={page.featuredImage}
          alt={page.title}
          className="mb-8 w-full rounded-lg object-cover"
        />
      )}
      <h1 className="text-3xl font-semibold">{page.title}</h1>
      {page.content && (
        <div
          className="prose mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
        />
      )}
    </article>
  );
}
