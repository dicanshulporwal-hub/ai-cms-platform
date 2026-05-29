import type { ModuleComponentProps } from '@/types/template';
import { fetchBlogPosts } from '@/lib/api-client';

export async function BlogListModule({ config, moduleKey }: ModuleComponentProps) {
  const page = (config?.page as number) ?? 1;
  const limit = (config?.limit as number) ?? 10;

  const result = await fetchBlogPosts(page, limit);
  const posts = result?.data ?? [];

  if (posts.length === 0) {
    return (
      <section data-module={moduleKey} data-module-type="BLOG_LIST">
        <p>No blog posts available</p>
      </section>
    );
  }

  return (
    <section data-module={moduleKey} data-module-type="BLOG_LIST">
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: '1.5rem' }}>
            <article>
              {post.featuredImage && (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  loading="lazy"
                />
              )}
              <h2>
                <a href={`/blog/${post.slug}`}>{post.title}</a>
              </h2>
              {post.excerpt && <p>{post.excerpt}</p>}
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
