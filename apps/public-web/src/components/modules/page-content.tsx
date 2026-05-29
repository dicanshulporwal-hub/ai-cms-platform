import type { ModuleComponentProps } from '@/types/template';
import { fetchPageBySlug } from '@/lib/api-client';
import { sanitizeHtml } from '@/lib/sanitize-html';

export async function PageContentModule({ config, moduleKey }: ModuleComponentProps) {
  const slug = config?.slug as string;

  if (!slug) {
    return (
      <div data-module={moduleKey} data-module-type="PAGE_CONTENT">
        <p>Page not found</p>
      </div>
    );
  }

  const page = await fetchPageBySlug(slug);

  if (!page) {
    return (
      <div data-module={moduleKey} data-module-type="PAGE_CONTENT">
        <p>Page not found</p>
      </div>
    );
  }

  return (
    <article data-module={moduleKey} data-module-type="PAGE_CONTENT">
      <h1>{page.title}</h1>
      {page.featuredImage && (
        <img
          src={page.featuredImage}
          alt={page.title}
          loading="lazy"
        />
      )}
      {page.content && (
        <div
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
        />
      )}
    </article>
  );
}
