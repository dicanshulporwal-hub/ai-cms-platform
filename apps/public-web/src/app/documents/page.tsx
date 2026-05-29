import type { Metadata } from 'next';
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
      <section>
        <h1>Documents</h1>
        <p>No documents available.</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Documents</h1>
      {category && (
        <p>
          Filtered by category: <strong>{category}</strong>
        </p>
      )}
      <ul role="list">
        {documents.map((doc) => (
          <li key={doc.id}>
            <h2>{doc.title}</h2>
            {doc.category && <span data-category>{doc.category.name}</span>}
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
