import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchBlogBySlug } from '@/lib/api-client';
import { generateContentMetadata } from '@/lib/metadata';
import { sanitizeHtml } from '@/lib/sanitize-html';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogBySlug(slug);
  return generateContentMetadata(post, 'Blog Post Not Found');
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await fetchBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 animate-fade-in" aria-label={post.title}>
      {/* Back link */}
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Blog
      </Link>

      {/* Meta info */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <time
          dateTime={post.publishedAt}
          className="text-sm font-medium text-muted-foreground"
        >
          {new Date(post.publishedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>

        {post.category && (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {post.category.name}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {post.title}
      </h1>

      {/* Tags */}
      {post.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
          {post.tags.map((tag) => (
            <li
              key={tag.id}
              className="inline-flex items-center rounded-md border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag.name}
            </li>
          ))}
        </ul>
      )}

      {/* Featured image */}
      {post.featuredImage && (
        <div className="mt-8 overflow-hidden rounded-xl shadow-soft-lg">
          <img
            src={post.featuredImage}
            alt={`Featured image for ${post.title}`}
            className="w-full object-cover"
            loading="eager"
          />
        </div>
      )}

      {/* Content */}
      {post.content && (
        <div
          className="prose mt-10 max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />
      )}
    </article>
  );
}
