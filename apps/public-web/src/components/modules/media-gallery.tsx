import { PublicSection } from '@/design-system/components/PublicSection';
import { PublicGrid } from '@/design-system/components/PublicGrid';
import type { ModuleComponentProps } from '@/types/template';

interface MediaItem {
  src: string;
  alt: string;
  caption?: string;
}

/** MediaGalleryModule — images are lazy-loaded per Green Code policy. */
export function MediaGalleryModule({ config, moduleKey }: ModuleComponentProps) {
  const items = config?.items;
  const showTitle = config?.showTitle !== false;
  const displayTitle = (config?.displayTitle as string) || 'Gallery';
  const displayMode = (config?.displayMode as string) || 'grid';
  const limit = Number(config?.limit) || 8;

  if (!Array.isArray(items) || items.length === 0) return null;

  const mediaItems = (items as MediaItem[]).slice(0, limit);
  const cols = displayMode === 'compact' ? 6 : displayMode === 'large' ? 2 : 4;

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      backgroundVariant="surface"
      spacingVariant="md"
      id={`module-${moduleKey}`}
    >
      <div data-module={moduleKey} data-module-type="MEDIA_GALLERY" aria-label="Media gallery">
        <PublicGrid cols={cols as 2 | 3 | 4 | 6} gap="sm">
          {mediaItems.map((item, index) => {
            const altText = item.alt || item.caption || `Gallery image ${index + 1}`;
            return (
              <figure
                key={`${item.src}-${index}`}
                tabIndex={0}
                className="group m-0 overflow-hidden rounded-[var(--public-radius)] border border-[var(--public-border)] bg-[var(--public-background)] shadow-[var(--public-shadow-sm)] transition-shadow hover:shadow-[var(--public-shadow-md)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--public-focus-ring)]"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.src}
                    alt={altText}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {item.caption && (
                  <figcaption className="px-3 py-2 text-xs text-[var(--public-text-muted)]">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </PublicGrid>
      </div>
    </PublicSection>
  );
}
