# Backup & Restore Manager

## Overview

Secure backup, restore, export, and import for CMS data. Supports full content backups, selective module exports, and safe restore with validation.

## Backup Package Format

JSON file containing:
```json
{
  "manifest": {
    "cmsName": "AI-first CMS",
    "backupVersion": "1.0.0",
    "createdAt": "2025-06-01T...",
    "createdBy": "admin@example.com",
    "jobType": "CONTENT_BACKUP",
    "includedModules": ["pages", "blogs", "faqs", "templates", "settings"]
  },
  "data": {
    "pages": [...],
    "blogs": [...],
    "faqs": [...],
    "categories": [...],
    "tags": [...],
    "templates": [...],
    "settings": {...}
  }
}
```

## Security

- Secrets excluded by default (`includeSecrets: false`)
- Only Super Admin can include secrets
- Password hashes never exported in content backups
- AI provider keys never exported unless secure full backup
- Backup files stored in private directory (not publicly accessible)
- Download requires JWT authentication + permission
- All actions audit-logged

## Green Code Decisions

- Queries use `select` (only needed fields exported)
- Paginated with `take: 1000` per table (prevents OOM)
- Temp files cleaned in `finally` blocks
- No heavy ZIP library for MVP (JSON format)
- File size tracked for monitoring

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /backup-manager/summary | Dashboard summary |
| GET | /backups | List backup jobs |
| GET | /backups/:id | Get job details |
| POST | /backups/create | Create backup |
| POST | /backups/:id/download | Download backup file |
| DELETE | /backups/:id | Delete backup + file |
| POST | /exports/create | Export content type |
| GET | /exports | List exports |

## Admin Route

`/backup-manager` — Dashboard with create backup, quick export, history

## How to Create a Backup

1. Go to `/backup-manager`
2. Toggle what to include (templates, settings, users, media)
3. Click "Create Backup"
4. Backup appears in history with COMPLETED status
5. Download via the API (file served with auth)

## How to Export Content

1. Go to `/backup-manager`
2. Click "Export PAGES", "Export BLOGS", or "Export FAQS"
3. JSON file created in backup directory

## Permissions

- Super Admin: Full access including secrets
- Admin: Create/download backups (no secrets)
- Other roles: No access

## Limitations (MVP)

- JSON format (not ZIP with assets yet)
- No restore UI yet (manual restore via API)
- No media file backup (metadata only)
- No encryption yet
- No scheduled backups yet
