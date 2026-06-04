import Link from 'next/link';
import { Image as ImageIcon } from 'lucide-react';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface GalleryItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  isFeatured: boolean;
  publishedAt: string | null;
  _count: { images: number };
}

async function fetchGalleries(): Promise<{ data: GalleryItem[]; meta: any } | null> {
  try {
    const res = await fetch(`${API_BASE}/public/galleries?limit=24`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PublicGalleriesPage() {
  const result = await fetchGalleries();
  const galleries = result?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--template-text, #111827)' }}>
          Photo Gallery
        </h1>
        <p className="mt-2 text-muted-foreground">Browse our photo albums and galleries</p>
      </div>

      {galleries.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No galleries available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <Link
              key={gallery.id}
              href={`/galleries/${gallery.slug}`}
              className="group block rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                {gallery.coverImageUrl ? (
                  <img
                    src={gallery.coverImageUrl}
                    alt={gallery.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {gallery.isFeatured && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-white">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {gallery.title}
                </h2>
                {gallery.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {gallery.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {gallery._count.images} photo{gallery._count.images !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
