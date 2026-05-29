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
      <section aria-label="Blog">
        <h1>Blog</h1>
        <p>No blog posts available.</p>
      </section>
    );
  }

  return (
    <section aria-label="Blog">
      <h1>Blog</h1>
      <ul className="blog-list">
        {posts.map((post) => (
          <li key={post.id} className="blog-list-item">
            {post.featuredImage && (
              <img
                src={post.featuredImage}
                alt={`Featured image for ${post.title}`}
                className="blog-featured-image"
                loading="lazy"
              />
            )}
            <h2>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            {post.excerpt && <p className="blog-excerpt">{post.excerpt}</p>}
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
}
