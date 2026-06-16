import { PublicSection } from '@/design-system/components/PublicSection';
import { PublicBadge } from '@/design-system/components/PublicBadge';
import type { ModuleComponentProps } from '@/types/template';
import { fetchDocuments } from '@/lib/api-client';

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function fileTypeLabel(mimeType?: string | null): string {
  if (!mimeType) return 'FILE';
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'DOC';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'XLS';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PPT';
  return mimeType.split('/').pop()?.toUpperCase() ?? 'FILE';
}

export async function DocumentListModule({ config, moduleKey }: ModuleComponentProps) {
  const category = config?.category as string | undefined;
  const showTitle = config?.showTitle !== false;
  const displayTitle = (config?.displayTitle as string) || 'Documents';
  const showFileType = config?.showFileType !== false;
  const showFileSize = config?.showFileSize !== false;

  const documents = await fetchDocuments(category);

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      spacingVariant="md"
      id={`module-${moduleKey}`}
    >
      <div data-module={moduleKey} data-module-type="DOCUMENT_LIST">
        {!documents || documents.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--public-text-muted)]">No documents available.</p>
        ) : (
          <div className="divide-y divide-[var(--public-border)] rounded-[var(--public-radius)] border border-[var(--public-border)]">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 bg-[var(--public-background)] px-4 py-3 hover:bg-[var(--public-surface)] transition-colors"
              >
                {/* File type icon */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--public-radius)] text-xs font-bold text-[var(--public-text-inverse)]"
                  style={{ backgroundColor: 'var(--public-primary)' }}
                  aria-hidden="true"
                >
                  {showFileType ? fileTypeLabel(doc.mimeType) : '📄'}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-[var(--public-text)] truncate">{doc.title}</h3>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    {doc.category && (
                      <PublicBadge variant="info">{doc.category.name}</PublicBadge>
                    )}
                    {showFileSize && doc.fileSize && (
                      <span className="text-xs text-[var(--public-text-muted)]">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    )}
                  </div>
                </div>

                <a
                  href={doc.fileUrl}
                  download
                  aria-label={`Download ${doc.title}`}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-[var(--public-radius)] border border-[var(--public-border)] bg-[var(--public-background)] px-3 py-1.5 text-xs font-medium text-[var(--public-text)] hover:bg-[var(--public-primary)] hover:text-[var(--public-text-inverse)] hover:border-[var(--public-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
                >
                  ↓ Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicSection>
  );
}
