import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchBlogPosts } from '@/lib/api-client';

export const metadata: Metadata = {
  title: 'Blog',
};

export default async function BlogListingPage() {
  const result = await fetchBlogPosts();
  const posts = result?.data ?? [];

  if (posts.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8" aria-label="Blog">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Blog</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            No blog posts available yet. Check back soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8" aria-label="Blog">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Blog</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Latest articles and updates
        </p>
      </div>

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
                  alt={`Featured image for ${post.title}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
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
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                >
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-4">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Read more
                  <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
