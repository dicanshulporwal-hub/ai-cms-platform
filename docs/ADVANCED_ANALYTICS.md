# Advanced Analytics Module

## Overview

First-party analytics for the AI CMS Platform. Tracks content performance, search behavior, chatbot usage, form submissions, document downloads, and AI usage without requiring third-party analytics services.

## Architecture

```
Public Website → POST /public/analytics/event (no auth, fire-and-forget)
                         ↓
              AnalyticsTrackingService (validate, sanitize, store)
                         ↓
              AnalyticsEvent table (indexed by type, source, date)
                         ↓
Admin Dashboard ← AnalyticsService (aggregate on read, paginated)
```

## Green Code Decisions

- **No blocking**: Public tracking uses `fetch` with `keepalive: true` and catches all errors silently
- **Throttled**: Same event type limited to once per 2 seconds client-side
- **Paginated**: All admin queries use `take` limits
- **Selective**: Only needed fields fetched via `select`
- **Aggregation on read**: No background jobs needed for MVP (uses `groupBy`)
- **No heavy dependencies**: No chart library added — uses metric cards and tables
- **Module-aware**: Tracking disabled if analytics module is off
- **Privacy-first**: IP hashed, Do Not Track respected, no sensitive form data stored

## Event Types

| Event | Trigger | Module |
|-------|---------|--------|
| PAGE_VIEW | Page loaded | pages |
| BLOG_VIEW | Blog post loaded | blogs |
| DOCUMENT_VIEW | Document page loaded | documents |
| DOCUMENT_DOWNLOAD | Download button clicked | documents |
| FAQ_VIEW | FAQ page loaded | faqs |
| FORM_VIEW | Form page loaded | forms |
| FORM_SUBMISSION | Form submitted | forms |
| SEARCH_QUERY | Search performed | search |
| CHATBOT_OPENED | Chatbot widget opened | chatbot |
| CHATBOT_MESSAGE | Message sent to chatbot | chatbot |
| AI_REQUEST | AI feature used | ai |
| CUSTOM | Custom event | any |

## Public Tracking Endpoint

```
POST /public/analytics/event
Content-Type: application/json

{
  "eventType": "PAGE_VIEW",
  "moduleKey": "pages",
  "sourceType": "PAGE",
  "sourceId": "page-cuid",
  "sourceTitle": "About Us",
  "pageUrl": "/pages/about-us",
  "referrer": "https://google.com",
  "visitorId": "abc123",
  "sessionId": "xyz789",
  "metadata": {}
}
```

No JWT required. Rate-limited by event throttling. Metadata capped at 2KB.

## Admin APIs

| Method | Path | Description |
|--------|------|-------------|
| GET | /analytics/overview?days=30 | Overview metrics |
| GET | /analytics/content?days=30 | Top pages/blogs/downloads |
| GET | /analytics/search?days=30 | Search analytics |
| GET | /analytics/devices?days=30 | Device breakdown |
| GET | /analytics/recent | Recent events (last 50) |
| GET | /analytics/settings | Get settings |
| PUT | /analytics/settings | Update settings |

## Privacy & Security

- IP addresses are hashed (SHA-256, truncated to 16 chars)
- Do Not Track header respected when enabled in settings
- No sensitive form field values stored in metadata
- Metadata payload limited to 2KB
- No personal data exposed in admin APIs
- Retention configurable (default 90 days)
- Public endpoint validates event types (rejects unknown)

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| trackingEnabled | true | Master toggle |
| anonymizeIp | true | Hash IP addresses |
| respectDoNotTrack | true | Honor DNT header |
| retentionDays | 90 | Days to keep events |
| trackPageViews | true | Track page views |
| trackDownloads | true | Track document downloads |
| trackSearches | true | Track search queries |
| trackForms | true | Track form submissions |
| trackChatbot | true | Track chatbot usage |
| trackAiUsage | true | Track AI requests |

## Testing

1. Visit public site pages → check events in admin `/analytics`
2. Call tracking endpoint directly:
   ```bash
   curl -X POST http://localhost:3001/public/analytics/event \
     -H "Content-Type: application/json" \
     -d '{"eventType":"PAGE_VIEW","pageUrl":"/test","sourceTitle":"Test Page"}'
   ```
3. Admin dashboard: `http://localhost:3000/analytics`
4. Change date range (7d/30d/90d) to filter metrics
