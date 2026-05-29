import type { ModuleComponentProps } from '@/types/template';
import { sanitizeHtml } from '@/lib/sanitize-html';

export function CustomHtmlModule({ config }: ModuleComponentProps) {
  const html = config?.html;

  if (!html || typeof html !== 'string') {
    return null;
  }

  const sanitized = sanitizeHtml(html);

  return (
    <div
      data-module="custom-html"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
