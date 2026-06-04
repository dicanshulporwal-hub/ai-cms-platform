import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface GalleryImageData {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
}

interface GalleryData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  images: GalleryImageData[];
}

async function fetchGallery(slug: string): Promise<GalleryData | null> {
  try {
    const res = await fetch(`${API_BASE}/public/galleries/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const gallery = await fetchGallery(params.slug);
  if (!gallery) return { title: 'Gallery Not Found' };
  return {
    title: gallery.metaTitle || gallery.title,
    description: gallery.metaDescription || gallery.description || undefined,
  };
}

export default async function GalleryDetailPage({ params }: { params: { slug: string } }) {
  const gallery = await fetchGallery(params.slug);
  if (!gallery) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/galleries"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Galleries
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--template-text, #111827)' }}>
          {gallery.title}
        </h1>
        {gallery.description && (
          <p className="mt-2 text-muted-foreground max-w-2xl">{gallery.description}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {gallery.images.length} photo{gallery.images.length !== 1 ? 's' : ''}
          {gallery.publishedAt && (
            <> · Published {new Date(gallery.publishedAt).toLocaleDateString()}</>
          )}
        </p>
      </div>

      {/* Image Grid - Lightbox style */}
      {gallery.images.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">No photos in this gallery yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.images.map((img) => (
            <figure
              key={img.id}
              className="group relative rounded-lg overflow-hidden bg-muted aspect-square cursor-pointer"
            >
              <img
                src={img.thumbnailUrl || img.imageUrl}
                alt={img.altText || img.title || 'Gallery photo'}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                width={img.width || undefined}
                height={img.height || undefined}
              />
              {(img.title || img.description) && (
                <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.title && (
                    <p className="text-sm font-medium text-white">{img.title}</p>
                  )}
                  {img.description && (
                    <p className="text-xs text-white/80 mt-0.5 line-clamp-2">{img.description}</p>
                  )}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
