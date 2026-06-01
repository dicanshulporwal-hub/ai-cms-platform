# Analytics Events Reference

## Event Types

| Event Type | Module | Trigger | Source Type |
|-----------|--------|---------|-------------|
| `PAGE_VIEW` | pages | Page loaded on public site | PAGE |
| `BLOG_VIEW` | blogs | Blog post loaded | BLOG |
| `DOCUMENT_VIEW` | documents | Document page loaded | DOCUMENT |
| `DOCUMENT_DOWNLOAD` | documents | Download button clicked | DOCUMENT |
| `FAQ_VIEW` | faqs | FAQ page loaded | FAQ |
| `FORM_VIEW` | forms | Form page loaded | FORM |
| `FORM_SUBMISSION` | forms | Form submitted successfully | FORM |
| `SEARCH_QUERY` | search | Search performed | SEARCH |
| `CHATBOT_OPENED` | chatbot | Chatbot widget opened | CHATBOT |
| `CHATBOT_MESSAGE` | chatbot | Message sent to chatbot | CHATBOT |
| `AI_REQUEST` | ai | AI feature used (admin) | AI |
| `CUSTOM` | any | Custom event | CUSTOM |

## Event Payload

```json
{
  "eventType": "PAGE_VIEW",
  "moduleKey": "pages",
  "sourceType": "PAGE",
  "sourceId": "cuid-of-page",
  "sourceTitle": "About Us",
  "pageUrl": "/pages/about-us",
  "referrer": "https://google.com",
  "visitorId": "anonymous-client-id",
  "sessionId": "session-id",
  "metadata": {
    "key": "value"
  }
}
```

## Client-Side Usage (Public Website)

```typescript
import { trackPageView, trackBlogView, trackDocumentDownload, trackSearch, trackFormSubmission } from '@/lib/analytics';

// Track page view
trackPageView('About Us', 'page-cuid');

// Track blog view
trackBlogView('My Blog Post', 'blog-cuid');

// Track document download
trackDocumentDownload('Annual Report 2025', 'doc-cuid');

// Track search
trackSearch('government services');

// Track form submission
trackFormSubmission('Contact Form', 'form-cuid');
```

## Tracking Rules

1. **Throttled**: Same event type limited to once per 2 seconds
2. **Non-blocking**: Uses `fetch` with `keepalive: true`, catches all errors
3. **Privacy**: Respects Do Not Track header, IP hashed server-side
4. **Metadata limit**: Max 2KB per event
5. **Validation**: Only allowed event types accepted
6. **Module-aware**: Events rejected if tracking for that type is disabled

## Server-Side Storage

Each event is stored in `analytics_events` table with:
- Event type and module key
- Source type and ID (what content was interacted with)
- Page URL and referrer
- Anonymous visitor/session IDs
- Hashed IP (if anonymization enabled)
- Device type and browser (parsed from User-Agent)
- Timestamp

## Aggregation

Admin dashboard aggregates events using:
- `COUNT` for totals
- `GROUP BY sourceId` for top content
- `GROUP BY sourceTitle` for top searches
- `GROUP BY deviceType` for device breakdown
- Date range filtering via `createdAt >= since`

No background jobs — aggregation happens on read with database-level operations.
