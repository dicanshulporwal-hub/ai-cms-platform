import Link from 'next/link';
import { PublicSection } from '@/design-system/components/PublicSection';
import { PublicCard } from '@/design-system/components/PublicCard';
import { PublicGrid } from '@/design-system/components/PublicGrid';
import type { ModuleComponentProps } from '@/types/template';
import { fetchBlogPosts } from '@/lib/api-client';

export async function BlogListModule({ config, moduleKey }: ModuleComponentProps) {
  const page = Number(config?.page) || 1;
  const limit = Number(config?.limit) || 6;
  const showTitle = config?.showTitle !== false;
  const displayTitle = (config?.displayTitle as string) || 'Latest Updates';
  const showDate = config?.showDate !== false;
  const showImage = config?.showImage !== false;
  const displayMode = (config?.displayMode as string) || 'cards';

  const result = await fetchBlogPosts(page, limit);
  const posts = result?.data ?? [];

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      spacingVariant="md"
      id={`module-${moduleKey}`}
      actionLink={
        <Link href="/blog" className="text-sm font-medium text-[var(--public-primary)] hover:underline">
          View all →
        </Link>
      }
    >
      <div data-module={moduleKey} data-module-type="BLOG_LIST">
        {posts.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--public-text-muted)]">No posts available.</p>
        ) : (
          <PublicGrid cols={displayMode === 'grid' ? 3 : 2} gap="md">
            {posts.map((post) => (
              <PublicCard
                key={post.id}
                variant="bordered"
                image={
                  showImage && post.featuredImage
                    ? { src: post.featuredImage, alt: post.title }
                    : undefined
                }
                footer={
                  showDate && post.publishedAt ? (
                    <time
                      dateTime={post.publishedAt}
                      className="text-xs text-[var(--public-text-muted)]"
                    >
                      {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </time>
                  ) : undefined
                }
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block text-sm font-semibold text-[var(--public-text)] hover:text-[var(--public-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
                >
                  {post.title}
                </Link>
                {post.excerpt && (
                  <p className="mt-1 text-xs text-[var(--public-text-muted)] line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
              </PublicCard>
            ))}
          </PublicGrid>
        )}
      </div>
    </PublicSection>
  );
}
