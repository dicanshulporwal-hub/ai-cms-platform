# Green Code Review Checklist

Use this checklist during code reviews to ensure changes follow green code principles.

## Database Queries

- [ ] No N+1 query patterns (use `include` or batch queries)
- [ ] Only required fields are selected (use `select` where possible)
- [ ] Results are paginated (no unbounded `findMany` without `take`)
- [ ] Indexes exist for filtered/sorted columns
- [ ] No redundant queries (same data fetched multiple times in one request)
- [ ] Soft-deleted records are filtered with `deletedAt: null`
- [ ] Bulk operations use `createMany`/`updateMany` where applicable

## API Design

- [ ] Response payloads contain only necessary data
- [ ] List endpoints have pagination (`take`, `skip`, or cursor)
- [ ] No sensitive/internal data exposed in public endpoints
- [ ] Appropriate HTTP caching headers set for static content
- [ ] Error responses are concise (no stack traces in production)
- [ ] Request validation happens early (fail fast, save resources)

## Frontend

- [ ] No unnecessary re-renders (check React Query keys, memo usage)
- [ ] Heavy components are lazy-loaded or code-split
- [ ] Images use `loading="lazy"` where appropriate
- [ ] No polling; use revalidation intervals or manual refresh
- [ ] Bundle size impact considered for new dependencies
- [ ] Server components used where client interactivity is not needed

## AI Usage

- [ ] AI is only called when simpler logic cannot achieve the result
- [ ] AI model selection uses the cost-aware router
- [ ] AI responses are not called redundantly (cache if idempotent)
- [ ] Token usage is logged
- [ ] AI-generated content is saved as DRAFT (not auto-published)
- [ ] Prompts are concise and focused (avoid wasting tokens)

## External Requests

- [ ] All external HTTP requests have timeouts
- [ ] External request count is limited per operation
- [ ] No SSRF risk (user input not used directly in fetch URLs)
- [ ] Failed external requests are handled gracefully (no crash)
- [ ] Rate limiting considered for bulk external checks

## File Operations

- [ ] File size validated before processing
- [ ] Large files are streamed, not loaded entirely into memory
- [ ] Temporary files are cleaned up after use
- [ ] Duplicate file detection before storage
- [ ] Appropriate file type validation (allowlist, not blocklist)

## Security (Green + Safe)

- [ ] No secrets in response payloads
- [ ] Input sanitized before database storage
- [ ] HTML content sanitized before rendering
- [ ] Auth checks happen before expensive operations
- [ ] Rate limiting on resource-intensive endpoints

## Testing

- [ ] New features have at least basic happy-path coverage
- [ ] Performance-sensitive code has benchmark or load consideration
- [ ] No test that makes real external HTTP calls without mocking
- [ ] Test data is cleaned up (no orphaned records)

## Documentation

- [ ] New APIs are documented (endpoint, method, auth, response)
- [ ] New environment variables are added to `.env.example`
- [ ] Breaking changes are noted in commit message
- [ ] Complex logic has inline comments explaining "why"

---

## Scoring Guide

For each PR, count checked items vs total applicable items:
- **90-100%**: Excellent green code
- **70-89%**: Good, minor improvements possible
- **50-69%**: Needs improvement before merge
- **Below 50%**: Requires significant rework
