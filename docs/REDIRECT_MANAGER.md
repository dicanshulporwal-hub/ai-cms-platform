# Redirect Manager & 404 Tracking

## Overview

Manage URL redirects (301/302/307/308), track 404 errors, detect loops, and protect SEO.

## Sidebar Location

SEO & Quality → Redirects (with sub-items: Redirect Rules, 404 Logs)

## Features

- Manual 301/302/307/308 redirects
- Exact and prefix match types
- Loop and chain detection before save
- 404 tracking (deduplicated by path, hit count)
- Create redirect directly from 404 log
- In-memory cached redirect lookup (60s TTL)
- Hit tracking (non-blocking)

## Public Endpoints (no auth)

| Endpoint | Description |
|----------|-------------|
| `GET /public/redirects/resolve?path=/old` | Resolve redirect for a path |
| `POST /public/redirects/404-log` | Log a 404 occurrence |

## Admin APIs

| Method | Path | Description |
|--------|------|-------------|
| GET | /redirects/summary | Dashboard stats |
| GET | /redirects | List rules |
| POST | /redirects | Create rule |
| PUT | /redirects/:id | Update rule |
| DELETE | /redirects/:id | Delete rule |
| GET | /redirects/404 | List 404 logs |
| PATCH | /redirects/404/:id/status | Update 404 status |
| POST | /redirects/404/:id/create-redirect | Create redirect from 404 |

## Green Code

- Active rules cached in memory (60s TTL, max 500 rules)
- Cache invalidated on create/update/delete
- Hit tracking is non-blocking (fire-and-forget)
- 404 logs deduplicated (increment hitCount, not new row per hit)
- Lists paginated (take: 50)
- Admin/API routes excluded from 404 logging

## Security

- Cannot redirect admin routes by default
- Cannot redirect API routes
- Loop detection prevents infinite redirects
- Chain detection warns about multi-hop redirects
