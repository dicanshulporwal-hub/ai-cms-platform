/**
 * Lightweight public analytics client.
 * - Never blocks page rendering
 * - Fails silently
 * - Throttles events (max 1 per type per 2 seconds)
 * - Respects Do Not Track
 * - No JWT required
 */

const API_BASE = process.env.NEXT_PUBLIC_ANALYTICS_API || 'http://localhost:3001';
const ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false';
const THROTTLE_MS = 2000;

const lastSent: Record<string, number> = {};

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('_a_vid');
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('_a_vid', id);
  }
  return id;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('_a_sid');
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('_a_sid', id);
  }
  return id;
}

export function trackEvent(eventType: string, data?: { moduleKey?: string; sourceType?: string; sourceId?: string; sourceTitle?: string; metadata?: Record<string, unknown> }) {
  if (!ENABLED || typeof window === 'undefined') return;

  // Respect Do Not Track
  if (navigator.doNotTrack === '1') return;

  // Throttle same event type
  const now = Date.now();
  if (lastSent[eventType] && now - lastSent[eventType] < THROTTLE_MS) return;
  lastSent[eventType] = now;

  const payload = {
    eventType,
    moduleKey: data?.moduleKey,
    sourceType: data?.sourceType,
    sourceId: data?.sourceId,
    sourceTitle: data?.sourceTitle,
    pageUrl: window.location.pathname,
    referrer: document.referrer || undefined,
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    metadata: data?.metadata,
  };

  // Fire and forget — never block rendering
  fetch(`${API_BASE}/public/analytics/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {}); // Silent failure
}

export function trackPageView(title?: string, sourceId?: string) {
  trackEvent('PAGE_VIEW', { moduleKey: 'pages', sourceType: 'PAGE', sourceId, sourceTitle: title });
}

export function trackBlogView(title?: string, sourceId?: string) {
  trackEvent('BLOG_VIEW', { moduleKey: 'blogs', sourceType: 'BLOG', sourceId, sourceTitle: title });
}

export function trackDocumentDownload(title?: string, sourceId?: string) {
  trackEvent('DOCUMENT_DOWNLOAD', { moduleKey: 'documents', sourceType: 'DOCUMENT', sourceId, sourceTitle: title });
}

export function trackSearch(query: string) {
  trackEvent('SEARCH_QUERY', { moduleKey: 'search', sourceType: 'SEARCH', sourceTitle: query });
}

export function trackFormSubmission(formTitle?: string, sourceId?: string) {
  trackEvent('FORM_SUBMISSION', { moduleKey: 'forms', sourceType: 'FORM', sourceId, sourceTitle: formTitle });
}
