# Sitemap & Robots Manager

## Overview

Manages XML sitemap generation, robots.txt, and SEO crawl settings for the public website. Only published, public content appears in the sitemap.

## Public Endpoints

| Endpoint | Response | Description |
|----------|----------|-------------|
| `GET /sitemap.xml` | application/xml | Auto-generated XML sitemap |
| `GET /robots.txt` | text/plain | Auto-generated or custom robots.txt |

## Sitemap Generation Logic

Includes only:
- Published pages (`/pages/:slug`)
- Published blog posts (`/blog/:slug`)
- Documents page (`/documents`)
- FAQs page (`/faqs`)
- Manual entries added by admin

Excludes:
- Draft/archived/deleted content
- Admin routes
- API routes
- Auth routes
- Disabled module content
- Private content

## Module-Aware Rules

- If Blogs module disabled → no blog URLs in sitemap
- If Documents module disabled → no document URLs
- If FAQ module disabled → no FAQ URLs
- If Forms module disabled → no form URLs

## Robots.txt Default

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /login
Disallow: /api
Disallow: /settings
Disallow: /users
Disallow: /roles
Disallow: /workflow

Sitemap: https://yoursite.com/sitemap.xml
```

## Admin Routes

- `/seo/sitemap` — Sitemap settings, content toggles, generate, preview
- `/seo/robots` — Robots.txt rules, custom content, preview

## Admin APIs

| Method | Path | Description |
|--------|------|-------------|
| GET | /sitemap/settings | Get sitemap settings |
| PUT | /sitemap/settings | Update settings |
| POST | /sitemap/generate | Generate sitemap |
| GET | /sitemap/preview | Preview XML + warnings |
| GET | /sitemap/entries | List entries |
| POST | /sitemap/entries | Create manual entry |
| PUT | /sitemap/entries/:id | Update entry |
| DELETE | /sitemap/entries/:id | Delete entry |
| GET | /robots/settings | Get robots settings |
| PUT | /robots/settings | Update robots settings |
| GET | /robots/preview | Preview robots.txt |
| GET | /seo-crawl-rules | List crawl rules |
| POST | /seo-crawl-rules | Create rule |
| PUT | /seo-crawl-rules/:id | Update rule |
| DELETE | /seo-crawl-rules/:id | Delete rule |

## Testing

1. Visit `http://localhost:3001/sitemap.xml` — should return valid XML
2. Visit `http://localhost:3001/robots.txt` — should return text/plain
3. Admin: `/seo/sitemap` — configure and generate
4. Admin: `/seo/robots` — configure crawl rules

## Validation Warnings

- Site base URL not configured
- No published content found
- Duplicate URLs detected
- Disabled module entries
