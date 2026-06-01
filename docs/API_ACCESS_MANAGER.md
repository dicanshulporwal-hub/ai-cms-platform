# API Access / Headless CMS Manager

## Overview

Expose published CMS content through secure API keys for external applications (mobile apps, kiosks, microsites, integrations).

## Sidebar Location

Operations → API Access (with sub-items: Overview, API Clients, API Logs)

## Security Design

- API keys generated as `cms_live_` + 48 random hex chars
- Only SHA-256 hash stored in database (never plain key)
- Full key shown only once during creation
- Keys can be revoked instantly
- Keys cannot access admin APIs, draft content, or private data
- Only PUBLISHED content returned

## Content Delivery API

Base: `GET /api/v1/content/`

| Endpoint | Scope | Description |
|----------|-------|-------------|
| `/pages` | pages.read | List published pages |
| `/pages/:slug` | pages.read | Get page by slug |
| `/blogs` | blogs.read | List published blogs |
| `/blogs/:slug` | blogs.read | Get blog by slug |
| `/faqs` | faqs.read | List published FAQs |

### Authentication

```
Authorization: Bearer cms_live_YOUR_API_KEY
```

### Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

## Available Scopes

| Scope | Module | Description |
|-------|--------|-------------|
| pages.read | pages | Read published pages |
| blogs.read | blogs | Read published blogs |
| documents.read | documents | Read published documents |
| faqs.read | faqs | Read published FAQs |
| forms.read | forms | Read public forms |
| media.read | media | Read media assets |
| search.read | search | Search content |

## Admin APIs

| Method | Path | Description |
|--------|------|-------------|
| GET | /api-access/summary | Dashboard stats |
| GET | /api-access/clients | List clients |
| POST | /api-access/clients | Create client (returns key once) |
| GET | /api-access/clients/:id | Get client |
| PUT | /api-access/clients/:id | Update client |
| PATCH | /api-access/clients/:id/revoke | Revoke client |
| DELETE | /api-access/clients/:id | Delete client |
| GET | /api-access/logs | Access logs |
| GET | /api-access/scopes | Available scopes |

## Green Code

- Content delivery uses `select` (only safe public fields)
- All lists paginated (max 50 per page)
- Disabled modules excluded from responses
- Logs paginated (take: 50)
- `lastUsedAt` updated non-blocking
- No heavy dependencies
