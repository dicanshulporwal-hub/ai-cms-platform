import { FileText, Download } from 'lucide-react';
import type { ModuleComponentProps } from '@/types/template';
import { fetchDocuments } from '@/lib/api-client';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export async function DocumentListModule({ config, moduleKey }: ModuleComponentProps) {
  const category = config?.category as string | undefined;
  const documents = await fetchDocuments(category);

  if (!documents || documents.length === 0) {
    return (
      <section data-module={moduleKey} data-module-type="DOCUMENT_LIST" className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground">No documents available</p>
        </div>
      </section>
    );
  }

  return (
    <section data-module={moduleKey} data-module-type="DOCUMENT_LIST" className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:shadow-soft-lg hover:border-primary/20"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-card-foreground truncate">
                {doc.title}
              </h3>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {doc.category && (
                  <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 font-medium">
                    {doc.category.name}
                  </span>
                )}
                <span className="uppercase">{doc.mimeType?.split('/').pop() ?? 'file'}</span>
                <span>•</span>
                <span>{formatFileSize(doc.fileSize ?? 0)}</span>
              </div>
            </div>
            <a
              href={doc.fileUrl}
              download
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
