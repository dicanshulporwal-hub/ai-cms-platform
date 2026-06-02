# Announcements, Notices, Circulars & Office Orders

## Overview

Public-sector-ready module for creating, categorizing, publishing, and displaying notices, circulars, office orders, and important alerts.

## Sidebar Location

Content → Announcements (All, Categories)

## Announcement Types

| Type | Usage |
|------|-------|
| NOTICE | General public notices |
| CIRCULAR | Internal/external circulars |
| OFFICE_ORDER | Office orders and directives |
| ANNOUNCEMENT | General announcements |
| ALERT | Urgent alerts |
| RECRUITMENT | Job openings |
| RESULT | Exam/interview results |
| PUBLIC_ADVISORY | Public advisories |

## Status Flow

```
DRAFT → UNDER_REVIEW → APPROVED → PUBLISHED → ARCHIVED/EXPIRED
```

## Public Rules

- Only PUBLISHED announcements shown publicly
- Expired items (expiresAt < now) hidden from listing
- Pinned items shown first
- Important items shown with badge
- Draft/archived/deleted never shown publicly

## API Endpoints

### Public (no auth)
| Method | Path | Description |
|--------|------|-------------|
| GET | /public/announcements | List published |
| GET | /public/announcements/:slug | Get by slug |
| GET | /public/announcement-categories | List categories |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | /announcements | List all |
| POST | /announcements | Create |
| PUT | /announcements/:id | Update |
| DELETE | /announcements/:id | Delete |
| POST | /announcements/:id/publish | Publish |
| POST | /announcements/:id/archive | Archive |
| PATCH | /announcements/:id/pin | Toggle pin |
| PATCH | /announcements/:id/important | Toggle important |

## Green Code

- Lists paginated (take: 50)
- Public listing uses select (only needed fields)
- Expired items filtered at query level
- Pinned/important sorted in DB (not in memory)
- No heavy dependencies
