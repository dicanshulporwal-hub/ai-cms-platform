# Green Code Policy

## Purpose

This document defines the Green Code standards for the AI CMS Platform. Green Code means writing software that is energy-efficient, resource-conscious, and environmentally responsible without sacrificing functionality or user experience.

## Principles

### 1. Minimize Unnecessary Computation
- Avoid redundant database queries. Use caching where appropriate.
- Do not fetch data that is not needed. Select only required fields.
- Avoid N+1 query patterns. Use eager loading or batch queries.
- Do not run expensive operations on every request. Use revalidation intervals.

### 2. Reduce Network Overhead
- Minimize payload sizes. Do not send unused fields to the client.
- Use pagination for list endpoints. Never return unbounded result sets.
- Compress responses where supported.
- Use HTTP caching headers (Cache-Control, ETag) for static and semi-static content.
- Avoid unnecessary API calls from the frontend. Batch where possible.

### 3. Efficient Frontend Rendering
- Use server-side rendering for initial page loads (Next.js default).
- Lazy-load components that are not immediately visible.
- Avoid re-rendering entire component trees for small state changes.
- Use React Query's stale-while-revalidate pattern instead of polling.
- Minimize client-side JavaScript bundle size.

### 4. Database Efficiency
- Add indexes for frequently queried columns.
- Use `select` to fetch only needed fields instead of full records.
- Avoid storing large blobs in the database. Use file storage.
- Use soft deletes with indexed `deletedAt` columns for efficient filtering.
- Limit query results with `take` / `limit`.

### 5. AI Provider Efficiency
- Route AI requests through the cost-aware AI Router.
- Prefer free-tier models for non-critical tasks.
- Cache AI responses where the same input produces the same output.
- Do not call AI providers for operations that can be done with simple logic.
- Log token usage to monitor and optimize AI costs.

### 6. File and Media Efficiency
- Validate file sizes before upload. Reject oversized files early.
- Do not store duplicate files. Check for existing uploads.
- Use appropriate image formats (WebP preferred for web).
- Set maximum upload sizes per file type.

### 7. Background Processing
- Do not block request threads with long-running operations.
- Use async processing for scans, audits, and bulk operations.
- Set timeouts for external HTTP requests.
- Limit concurrent external requests to avoid resource exhaustion.

### 8. Environment-Specific Optimization
- In development: disable caching for fast iteration.
- In production: enable caching, compression, and CDN.
- Use environment variables to control feature flags and performance settings.

## Anti-Patterns to Avoid

| Anti-Pattern | Green Alternative |
|---|---|
| Fetching all records without pagination | Use `take`/`skip` with limits |
| SELECT * from database | Select only needed fields |
| Polling every second | Use webhooks or long revalidation |
| Loading all modules on every page | Lazy-load based on template regions |
| Calling AI for trivial string operations | Use simple string/regex logic |
| Storing base64 images in database | Store files on disk, reference by URL |
| Running full site scan on every page load | Run on-demand or scheduled |
| Fetching external links without timeout | Always set request timeouts |

## Measurement

Track these metrics to ensure green code compliance:
- Average API response time
- Database query count per request
- AI token usage per feature
- Bundle size (client-side JS)
- Number of unnecessary re-renders
- External HTTP request count and timeout rate

## Enforcement

- Code reviews should check for green code compliance.
- Use the Green Code Review Checklist for pull requests.
- AI-generated code must follow these guidelines.
- Performance regressions should be treated as bugs.
