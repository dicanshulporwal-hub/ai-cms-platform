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
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Welcome
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Welcome to our website. Content is being prepared and will be available
            soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 animate-fade-in">
      {page.featuredImage && (
        <div className="mb-10 overflow-hidden rounded-xl shadow-soft-lg">
          <img
            src={page.featuredImage}
            alt={page.title}
            className="w-full object-cover"
          />
        </div>
      )}
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        {page.title}
      </h1>
      {page.content && (
        <div
          className="prose mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
        />
      )}
    </article>
  );
}
