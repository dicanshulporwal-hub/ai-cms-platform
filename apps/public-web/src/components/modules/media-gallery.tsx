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
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4"
    >
      {mediaItems.map((item, index) => {
        const altText = item.alt || item.caption || 'Gallery image';

        return (
          <figure
            key={`${item.src}-${index}`}
            tabIndex={0}
            className="m-0 overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <img
              src={item.src}
              alt={altText}
              width={400}
              height={300}
              loading="lazy"
              className="w-full h-auto object-cover"
            />
            {item.caption && (
              <figcaption className="p-2 text-sm text-gray-600">
                {item.caption}
              </figcaption>
            )}
          </figure>
        );
      })}
    </section>
  );
}
