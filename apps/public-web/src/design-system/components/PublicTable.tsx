import type { ReactNode } from 'react';

interface PublicTableColumn {
  key: string;
  header: string;
  className?: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

interface PublicTableProps {
  columns: PublicTableColumn[];
  rows: Record<string, unknown>[];
  emptyMessage?: string;
  caption?: string;
  className?: string;
}

/**
 * PublicTable — accessible responsive table.
 * On mobile, falls back to card-like layout using CSS.
 */
export function PublicTable({
  columns,
  rows,
  emptyMessage = 'No records found.',
  caption,
  className = '',
}: PublicTableProps) {
  return (
    <div className={['overflow-x-auto rounded-[var(--public-radius)] border border-[var(--public-border)]', className].join(' ')}>
      <table className="w-full border-collapse text-sm" aria-label={caption}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="bg-[var(--public-surface)]">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={['px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--public-text-muted)] border-b border-[var(--public-border)]', col.className ?? ''].join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--public-text-muted)]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-[var(--public-border)] last:border-b-0 hover:bg-[var(--public-surface)]"
              >
                {columns.map((col) => (
                  <td key={col.key} className={['px-4 py-3 text-[var(--public-text)]', col.className ?? ''].join(' ')}>
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
