# Deployment & Environment Manager

## Overview

Manage deployment readiness, environment profiles, variable checklists, and deployment logs from the admin panel. Does not deploy directly — focuses on readiness validation and documentation.

## Sidebar Location

Operations → Deployment (with sub-items: Overview, Environments, Checklist, Logs)

## Features

- Environment profiles (Local, Development, Staging, Production)
- Readiness check (validates env vars, config, services)
- Deployment checklist (15 items across 10 categories)
- Deployment logs (manual notes and automated check results)

## Readiness Checks

| Check | Category | Severity |
|-------|----------|----------|
| DATABASE_URL configured | DATABASE | CRITICAL |
| JWT_SECRET configured | SECURITY | CRITICAL |
| Public website URL | PUBLIC_WEBSITE | HIGH |
| AI provider configured | AI | MEDIUM |
| Media upload directory | STORAGE | HIGH |
| Backup directory | BACKUP | MEDIUM |
| API port configured | SYSTEM | LOW |

## Checklist Categories

BUILD, DATABASE, SECURITY, STORAGE, AI, PUBLIC_WEBSITE, SEO, ACCESSIBILITY, BACKUP, MONITORING, GREEN_CODE

## Scoring

Score = (passed / total) × 100
- ≥80%: READY
- 50-79%: WARNING
- <50%: FAILED

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /deployment/summary | Dashboard summary |
| GET | /deployment/environments | List environments |
| POST | /deployment/environments | Create environment |
| GET | /deployment/environments/:id | Get environment |
| PUT | /deployment/environments/:id | Update environment |
| DELETE | /deployment/environments/:id | Delete environment |
| PATCH | /deployment/environments/:id/default | Set as default |
| POST | /deployment/environments/:id/readiness/run | Run readiness check |
| GET | /deployment/checklist | Get checklist items |
| POST | /deployment/checklist/seed | Seed default checklist |
| GET | /deployment/logs | Get deployment logs |

## Security

- No secrets exposed in API responses
- Readiness check reads env vars server-side only
- Only shows configured/missing status, never raw values
- Super Admin/Admin access only

## Green Code

- Readiness check runs only on explicit user action
- Lists paginated (take: 20-50)
- No heavy dependencies
- No automatic deployment
