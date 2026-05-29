import type { ModuleComponentProps } from '@/types/template';
import { fetchPageBySlug } from '@/lib/api-client';
import { sanitizeHtml } from '@/lib/sanitize-html';

export async function PageContentModule({ config, moduleKey }: ModuleComponentProps) {
  const slug = config?.slug as string;

  if (!slug) {
    return (
      <div data-module={moduleKey} data-module-type="PAGE_CONTENT" className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </div>
    );
  }

  const page = await fetchPageBySlug(slug);

  if (!page) {
    return (
      <div data-module={moduleKey} data-module-type="PAGE_CONTENT" className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </div>
    );
  }

  return (
    <article data-module={moduleKey} data-module-type="PAGE_CONTENT" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {page.title}
        </h1>
        {page.featuredImage && (
          <div className="mt-8 overflow-hidden rounded-xl shadow-soft-lg">
            <img
              src={page.featuredImage}
              alt={page.title}
              loading="lazy"
              className="w-full object-cover"
            />
          </div>
        )}
        {page.content && (
          <div
            className="prose mt-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
          />
        )}
      </div>
    </article>
  );
}
