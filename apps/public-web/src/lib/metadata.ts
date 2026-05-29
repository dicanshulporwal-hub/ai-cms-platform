import type { Metadata } from 'next';
import type { PageData, BlogPost } from '@/types/content';

export function generateContentMetadata(content: PageData | BlogPost | null, fallbackTitle?: string): Metadata {
  if (!content) {
    return { title: fallbackTitle ?? 'Page Not Found' };
  }

  const title = content.metaTitle ?? content.title;
  const description = content.metaDescription ?? content.excerpt ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: content.featuredImage ? [{ url: content.featuredImage }] : undefined,
    },
  };
}
