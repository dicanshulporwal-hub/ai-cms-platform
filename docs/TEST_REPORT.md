# Test Report — June 2, 2026

## Test Environment
- API: http://localhost:3001
- Admin: http://localhost:3000
- Public: http://localhost:3002
- Database: MySQL (ai_cms)
- Prisma client: regenerated after all schema changes

## Endpoint Test Results

| # | Test | URL | Expected | Actual | Status |
|---|------|-----|----------|--------|--------|
| 1 | API Health | /health | 200 | 200 | ✅ PASS |
| 2 | Sitemap XML | /sitemap.xml | 200 | 200 | ✅ PASS |
| 3 | Robots.txt | /robots.txt | 200 | 200 | ✅ PASS |
| 4 | Template Render Data | /public/template/render-data | 200 | 200 | ✅ PASS |
| 5 | Structured Data | /public/structured-data/global | 200 | 200 | ✅ PASS |
| 6 | Public Announcements | /public/announcements | 200 | 200 | ✅ PASS |
| 7 | Public Menus | /public/menus | 200 | 200 | ✅ PASS |
| 8 | Redirect Resolve | /public/redirects/resolve?path=/test | 200 | 200 | ✅ PASS |
| 9 | Public Page (home) | /public/pages/home | 404 | 404 | ✅ PASS |
| 10 | Admin Web | http://localhost:3000 | 307 | 307 | ✅ PASS |
| 11 | Public Web | http://localhost:3002 | 200 | 200 | ✅ PASS |

## Admin Protected Endpoints (all return 401 without auth = route exists)

| Endpoint | Status |
|----------|--------|
| /deployment/summary | 401 ✅ |
| /api-access/summary | 401 ✅ |
| /redirects/summary | 401 ✅ |
| /content-calendar/summary | 401 ✅ |
| /menus/summary | 401 ✅ |
| /announcements/summary | 401 ✅ |
| /analytics/overview | 401 ✅ |
| /broken-links/summary | 401 ✅ |
| /accessibility/summary | 401 ✅ |
| /ai-prompts/governance | 401 ✅ |
| /backup-manager/summary | 401 ✅ |
| /integrations/summary | 401 ✅ |

## Issues Found & Fixed

| Issue | Severity | Resolution |
|-------|----------|-----------|
| Public Announcements 500 error | HIGH | Prisma client regenerated with new model |
| API running with stale Prisma client | HIGH | Regenerated and restarted |

## Known Limitations (not bugs)

| Item | Notes |
|------|-------|
| Analytics event endpoint is POST-only | GET returns 404 (correct) |
| Public pages /home returns 404 | No page with slug "home" published yet (correct) |
| Several modules need Prisma regeneration after deploy | Standard Prisma workflow |

## Recommendations

1. Always run `npx prisma generate` after schema changes before starting API
2. Add a pre-start script that generates Prisma client automatically
3. Consider adding health check that validates Prisma connection
4. Add integration tests for critical public endpoints
