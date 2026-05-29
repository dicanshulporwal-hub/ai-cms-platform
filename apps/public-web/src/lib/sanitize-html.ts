// apps/public-web/src/lib/sanitize-html.ts

const ALLOWED_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'a', 'strong', 'em', 'b', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
  'blockquote', 'pre', 'code', 'kbd', 'samp',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  'div', 'span', 'section', 'article', 'aside', 'figure', 'figcaption',
  'img', 'picture', 'source', 'video', 'audio',
  'details', 'summary', 'abbr', 'time', 'address',
]);

const ALLOWED_ATTRIBUTES = new Set([
  'href', 'src', 'alt', 'title', 'class', 'id', 'width', 'height',
  'target', 'rel', 'colspan', 'rowspan', 'scope', 'datetime',
  'loading', 'decoding', 'srcset', 'sizes', 'type', 'controls',
  'aria-label', 'aria-describedby', 'aria-hidden', 'role',
]);

const EVENT_HANDLER_PATTERN = /^on/i;
const JAVASCRIPT_URL_PATTERN = /^\s*javascript:/i;

export function sanitizeHtml(html: string): string {
  // Strip <script> tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Strip event handler attributes (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Strip javascript: protocol URLs
  sanitized = sanitized.replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '');

  // Strip <style> tags with expressions/behaviors
  sanitized = sanitized.replace(/<style\b[^>]*>[\s\S]*?(?:expression|behavior|url\s*\()[\s\S]*?<\/style>/gi, '');

  return sanitized;
}

export function isAllowedTag(tag: string): boolean {
  return ALLOWED_TAGS.has(tag.toLowerCase());
}

export function isAllowedAttribute(attr: string): boolean {
  if (EVENT_HANDLER_PATTERN.test(attr)) return false;
  return ALLOWED_ATTRIBUTES.has(attr.toLowerCase());
}

export function isSafeUrl(url: string): boolean {
  return !JAVASCRIPT_URL_PATTERN.test(url);
}
