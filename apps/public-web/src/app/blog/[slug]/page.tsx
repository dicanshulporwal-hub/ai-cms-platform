import { notFound } from 'next/navigation';
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
    <article aria-label={post.title}>
      <h1>{post.title}</h1>

      {post.featuredImage && (
        <img
          src={post.featuredImage}
          alt={`Featured image for ${post.title}`}
          className="blog-detail-featured-image"
          loading="eager"
        />
      )}

      <div className="blog-meta">
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleDateString()}
        </time>

        {post.category && (
          <span className="blog-category">{post.category.name}</span>
        )}

        {post.tags.length > 0 && (
          <ul className="blog-tags" aria-label="Tags">
            {post.tags.map((tag) => (
              <li key={tag.id} className="blog-tag">
                {tag.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {post.content && (
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />
      )}
    </article>
  );
}
