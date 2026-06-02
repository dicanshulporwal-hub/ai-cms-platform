# Tenders & Procurement Management

## Overview

Public-sector tender/procurement management module. Create, publish, manage, and archive government tenders with corrigendum support.

## Sidebar Location

Government Modules → Tenders (All Tenders, Categories)

## Tender Status Lifecycle

```
DRAFT → UNDER_REVIEW → APPROVED → PUBLISHED → OPEN → CLOSED → AWARDED/ARCHIVED
                                                          ↓
                                                      CANCELLED
```

## Procurement Types

GOODS, SERVICES, WORKS, CONSULTANCY, IT_SOFTWARE, MANPOWER, MAINTENANCE, OTHER

## Public Endpoints (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | /public/tenders | List published/open tenders |
| GET | /public/tenders/:slug | Get tender detail |
| GET | /public/tender-categories | List categories |

## Admin APIs

| Method | Path | Description |
|--------|------|-------------|
| GET | /tenders | List all |
| POST | /tenders | Create |
| PUT | /tenders/:id | Update |
| DELETE | /tenders/:id | Delete |
| POST | /tenders/:id/publish | Publish |
| POST | /tenders/:id/close | Close |
| POST | /tenders/:id/archive | Archive |
| POST | /tenders/:id/corrigenda | Add corrigendum |
| POST | /tender-corrigenda/:id/publish | Publish corrigendum |

## Corrigendum

- Amendments/addenda to published tenders
- Each corrigendum has title, description, optional number
- Must be published to appear on public detail page
- Tender's `corrigendumCount` auto-incremented

## Green Code

- Lists paginated (take: 50)
- Public listing uses select (only needed fields)
- Closing dates sorted in DB
- No heavy dependencies
- Draft/archived/cancelled hidden from public listing

## Public Rules

- Only PUBLISHED/OPEN tenders shown in active listing
- CLOSED/AWARDED/ARCHIVED shown in archive section
- DRAFT/UNDER_REVIEW never shown publicly
- Corrigenda only shown if status = PUBLISHED
