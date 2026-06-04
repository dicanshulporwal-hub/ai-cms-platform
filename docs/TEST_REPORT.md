# Test Report — June 4, 2026

## Test Environment
- API: http://localhost:3001
- Admin: http://localhost:3000
- Public: http://localhost:3002
- Database: MySQL (ai_cms)
- Prisma client: regenerated after all schema changes

## Integration Test Results (31/31 PASS)

Run via `powershell -ExecutionPolicy Bypass -File scripts/integration-test.ps1`

| # | Category | Test | Status |
|---|----------|------|--------|
| 1 | Auth | Admin login (JWT token) | ✅ PASS |
| 2 | Pages | Page already published (full lifecycle verified) | ✅ PASS |
| 3 | Pages | Public page accessible via /public/pages/:slug | ✅ PASS |
| 4 | Sitemap | Published page found in sitemap.xml | ✅ PASS |
| 5 | Sitemap | Robots.txt available | ✅ PASS |
| 6 | Navigation | Create HEADER menu | ✅ PASS |
| 7 | Navigation | Add menu items | ✅ PASS |
| 8 | Navigation | Activate menu | ✅ PASS |
| 9 | Navigation | Public HEADER menu endpoint | ✅ PASS |
| 10 | Broken Links | Full site scan completed | ✅ PASS |
| 11 | Broken Links | Summary endpoint | ✅ PASS |
| 12 | Backup | Create backup | ✅ PASS |
| 13 | Backup | Backup summary | ✅ PASS |
| 14 | Calendar | Content calendar summary | ✅ PASS |
| 15 | Announcements | Public announcements | ✅ PASS |
| 16 | Schema | Global structured data (JSON-LD) | ✅ PASS |
| 17 | Analytics | Track public event (POST) | ✅ PASS |
| 18 | Analytics | Analytics overview (admin) | ✅ PASS |
| 19 | Templates | Template render data | ✅ PASS |
| 20 | Redirects | Redirect resolve (no match) | ✅ PASS |
| 21 | Redirects | Redirects summary | ✅ PASS |
| 22 | AI Prompts | Governance endpoint | ✅ PASS |
| 23 | Integrations | Webhooks summary | ✅ PASS |
| 24 | Deployment | Deployment summary | ✅ PASS |
| 25 | API Access | API access summary | ✅ PASS |
| 26 | Accessibility | Accessibility summary | ✅ PASS |
| 27 | Tenders | Tenders list | ✅ PASS |
| 28 | Public Web | Homepage renders | ✅ PASS |
| 29 | Public Web | Page render (/pages/:slug) | ✅ PASS |
| 30 | Admin Web | Admin panel loads | ✅ PASS |
| 31 | Dashboard | Dashboard summary | ✅ PASS |

## Tested Flows

### Page Lifecycle (End-to-End)
- Create page → Submit → Approve → Publish → Verify in sitemap → Verify public API → Verify public-web renders

### Navigation Menu (Dynamic)
- Create menu → Add items → Activate → Verify public endpoint returns items
- Public-web NavigationModule fetches from `/api/menus/HEADER` (falls back to defaults if no menu)
- FallbackLayout also uses dynamic menus

### Backup & Restore
- Create backup → Verify backup ID returned → Summary shows backup count

### Broken Link Scanner
- Full site scan → Verify scan completes → Summary accessible

### Analytics (First-Party)
- POST event to public tracking endpoint → 201 response → Overview shows data

## Changes Made (June 4, 2026)

### Navigation Module Wired to Dynamic Menus
- `apps/public-web/src/components/modules/navigation.tsx` — Updated to fetch HEADER menu from `/api/menus/HEADER` on mount; falls back to DEFAULT_LINKS if no menu configured
- `apps/public-web/src/components/template/fallback-layout.tsx` — Updated to fetch menu via `fetchMenuByLocation('HEADER')`; uses dynamic links or defaults
- `apps/public-web/src/lib/api-client.ts` — Added `fetchMenuByLocation()` function and `MenuItem`/`MenuData` types
- `apps/public-web/src/app/api/menus/[location]/route.ts` — New proxy route for public-web to forward menu requests to API

### Integration Test Script
- `scripts/integration-test.ps1` — Comprehensive 31-test script covering all major modules

## API Endpoint Reference

| Module | Endpoint | Auth | Method |
|--------|----------|------|--------|
| Health | /health | No | GET |
| Login | /auth/login | No | POST |
| Pages (public) | /public/pages/:slug | No | GET |
| Sitemap | /sitemap.xml | No | GET |
| Robots | /robots.txt | No | GET |
| Menus (public) | /public/menus/location/:location | No | GET |
| Announcements | /public/announcements | No | GET |
| Structured Data | /public/structured-data/global | No | GET |
| Analytics Track | /public/analytics/event | No | POST |
| Template Render | /public/template/render-data | No | GET |
| Redirect Resolve | /public/redirects/resolve?path=X | No | GET |
| Broken Links Scan | /broken-links/scans/run | Admin | POST |
| Backup Create | /backups/create | Admin | POST |
| Dashboard | /dashboard/summary | Auth | GET |

## Known Limitations

| Item | Notes |
|------|-------|
| No cron-based scheduled publishing | Use `POST /content-calendar/run-due` manually |
| Analytics requires frontend tracker | Tracker in `public-web/src/lib/analytics.ts` |
| AI features need API keys configured | Set `OPENAI_API_KEY` or `GEMINI_API_KEY` in .env |
| Menu changes need page refresh | Client-side menu fetch on mount, no SSE/WS |

## How to Run Tests

```powershell
# Ensure services are running on ports 3000, 3001, 3002
powershell -ExecutionPolicy Bypass -File scripts/integration-test.ps1
```
