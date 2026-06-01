# Content Calendar & Publishing Scheduler

## Overview

Schedule content publishing, manage editorial planning, and run a publishing queue for Pages and Blogs.

## Sidebar Location

Workflow → Content Calendar (Calendar, Scheduled, Queue)

## How It Works

1. Admin creates a schedule (content + future date + action)
2. Schedule status: SCHEDULED
3. When `scheduledAt` passes, content becomes "due"
4. Admin clicks "Run Due" (or cron calls `POST /publishing-queue/run-due`)
5. Due content is published/archived automatically
6. Status becomes SCHEDULE_EXECUTED or SCHEDULE_FAILED

## Schedule Rules

- Content must exist and not be deleted
- No duplicate active schedules for same content
- `scheduledAt` must be in the future
- Only Pages and Blogs supported for MVP
- Failed schedules logged with reason

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /content-calendar/summary | Dashboard stats |
| GET | /content-calendar/month?year=&month= | Calendar month view |
| GET | /content-schedules | List schedules |
| POST | /content-schedules | Create schedule |
| POST | /content-schedules/:id/cancel | Cancel schedule |
| POST | /content-schedules/:id/execute-now | Execute immediately |
| POST | /publishing-queue/run-due | Run all due schedules |
| GET | /content-calendar/notes | List editorial notes |
| POST | /content-calendar/notes | Create note |

## Production Deployment

For automatic scheduled publishing, set up a cron job:
```bash
# Every 5 minutes
*/5 * * * * curl -X POST http://localhost:3001/publishing-queue/run-due -H "Authorization: Bearer ADMIN_TOKEN"
```

## Green Code

- Due query uses indexed `scheduledAt` + `status` (efficient)
- Batch limited to 20 per run
- Idempotent (won't re-execute already executed)
- No heavy calendar library (simple list/grid)
- Lists paginated (take: 50)
- Public site unaffected until content actually published
