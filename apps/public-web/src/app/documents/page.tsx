import type { Metadata } from 'next';
import { FileText, Download } from 'lucide-react';
import { fetchDocuments } from '@/lib/api-client';

export const metadata: Metadata = {
  title: 'Documents',
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

interface DocumentsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const { category } = await searchParams;
  const documents = await fetchDocuments(category);

  if (!documents || documents.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Documents</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            No documents available yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Documents</h1>
        {category && (
          <p className="mt-3 text-lg text-muted-foreground">
            Filtered by category: <span className="font-medium text-foreground">{category}</span>
          </p>
        )}
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-soft transition-all duration-200 hover:shadow-soft-lg hover:border-primary/20"
          >
            {/* Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-card-foreground truncate">
                {doc.title}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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

            {/* Download button */}
            <a
              href={doc.fileUrl}
              download
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
