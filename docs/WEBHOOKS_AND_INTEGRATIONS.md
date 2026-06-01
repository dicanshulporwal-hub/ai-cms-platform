# Webhooks & Integrations

## Overview

Send HTTP webhook events to external services when CMS actions happen. Supports custom endpoints, event subscriptions, signed payloads, retry handling, and delivery logs.

## Key Principles

- **Non-blocking**: Webhook delivery never blocks the original CMS action
- **Fail-safe**: If webhook fails, the CMS action still succeeds
- **Signed**: Payloads signed with HMAC SHA-256 if secret configured
- **Retryable**: Failed deliveries retry up to maxRetries with backoff
- **Audited**: All webhook actions are audit-logged

## Supported Events

| Event | Trigger |
|-------|---------|
| PAGE_PUBLISHED | Page published |
| BLOG_PUBLISHED | Blog post published |
| DOCUMENT_PUBLISHED | Document published |
| FORM_SUBMITTED | Form submission received |
| FAQ_PUBLISHED | FAQ published |
| WORKFLOW_PUBLISHED | Workflow item published |
| CHATBOT_LEAD_CAPTURED | Chatbot lead captured |
| TEMPLATE_ACTIVATED | Template activated |
| BACKUP_COMPLETED | Backup completed |
| USER_CREATED | New user created |

## Payload Format

```json
{
  "eventId": "evt-abc123",
  "eventType": "PAGE_PUBLISHED",
  "occurredAt": "2025-06-01T12:00:00Z",
  "source": "ai-first-cms",
  "data": {
    "id": "page-id",
    "title": "About Us",
    "slug": "about-us",
    "status": "PUBLISHED"
  }
}
```

## Security

- Payload signed with `X-CMS-Signature` header (HMAC SHA-256)
- Signature format: `HMAC(timestamp.payload, secret)`
- `X-CMS-Timestamp` header included for replay protection
- Secrets never exposed in API responses or logs
- Sensitive data excluded by default

## Delivery & Retry

- Timeout: configurable per endpoint (default 5s, max 15s)
- Retries: configurable (default 3, max 5)
- Backoff: attempt × 30 seconds
- Retry on: 5xx, 429, timeouts
- No retry on: 4xx (except 429)
- Failed after max retries: marked FAILED

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /webhooks | List endpoints |
| POST | /webhooks | Create endpoint |
| GET | /webhooks/:id | Get endpoint |
| PUT | /webhooks/:id | Update endpoint |
| DELETE | /webhooks/:id | Delete endpoint |
| POST | /webhooks/:id/test | Send test delivery |
| PATCH | /webhooks/:id/status | Enable/disable |
| GET | /webhooks/deliveries | List deliveries |
| POST | /webhooks/deliveries/:id/retry | Retry delivery |
| GET | /integrations/summary | Dashboard summary |

## Admin Route

`/integrations` — Dashboard with create webhook, endpoint list, delivery logs

## Green Code Decisions

- Delivery is fire-and-forget (async, non-blocking)
- Delivery logs paginated (take: 50)
- Endpoint list uses `select` (only needed fields)
- Payload size limited
- Retry count capped at 5
- No infinite retry loops
- No heavy queue dependency
