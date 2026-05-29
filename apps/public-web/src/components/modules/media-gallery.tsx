import type { ModuleComponentProps } from '@/types/template';

interface MediaItem {
  src: string;
  alt: string;
  caption?: string;
}

export function MediaGalleryModule({ config, moduleKey }: ModuleComponentProps) {
  const items = config?.items;

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const mediaItems = items as MediaItem[];

  return (
    <section
      data-module={moduleKey}
      data-module-type="MEDIA_GALLERY"
      aria-label="Media gallery"
      className="px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {mediaItems.map((item, index) => {
            const altText = item.alt || item.caption || 'Gallery image';

            return (
              <figure
                key={`${item.src}-${index}`}
                tabIndex={0}
                className="group m-0 overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.src}
                    alt={altText}
                    width={400}
                    height={300}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {item.caption && (
                  <figcaption className="px-3 py-2.5 text-sm text-muted-foreground">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
