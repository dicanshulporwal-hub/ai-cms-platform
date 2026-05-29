import type { ModuleComponentProps } from '@/types/template';
import { fetchBlogPosts } from '@/lib/api-client';

export async function BlogListModule({ config, moduleKey }: ModuleComponentProps) {
  const page = (config?.page as number) ?? 1;
  const limit = (config?.limit as number) ?? 10;

  const result = await fetchBlogPosts(page, limit);
  const posts = result?.data ?? [];

  if (posts.length === 0) {
    return (
      <section data-module={moduleKey} data-module-type="BLOG_LIST" className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground">No blog posts available</p>
        </div>
      </section>
    );
  }

  return (
    <section data-module={moduleKey} data-module-type="BLOG_LIST" className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-0.5"
            >
              {post.featuredImage && (
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <time
                  dateTime={post.publishedAt}
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {new Date(post.publishedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <h2 className="mt-2 text-lg font-semibold leading-snug text-card-foreground">
                  <a
                    href={`/blog/${post.slug}`}
                    className="transition-colors hover:text-primary"
                  >
                    {post.title}
                  </a>
                </h2>
                {post.excerpt && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
