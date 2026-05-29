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
      <section data-module={moduleKey} data-module-type="DOCUMENT_LIST">
        <p>No documents available</p>
      </section>
    );
  }

  return (
    <section data-module={moduleKey} data-module-type="DOCUMENT_LIST">
      <ul role="list">
        {documents.map((doc) => (
          <li key={doc.id}>
            <h3>{doc.title}</h3>
            {doc.category && (
              <span data-category>{doc.category.name}</span>
            )}
            <span data-file-type>{doc.mimeType}</span>
            <span data-file-size>{formatFileSize(doc.fileSize)}</span>
            <a href={doc.fileUrl} download>
              Download
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
