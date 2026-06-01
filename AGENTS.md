# AGENTS.md

## Project Intent

This repository is the foundation for an AI-first CMS MVP. Keep early changes small, explicit, and aligned with the planned stack.

## Planned Architecture

- `apps/admin-web`: Next.js admin experience for CMS operators.
- `apps/public-web`: Next.js public-facing site renderer.
- `apps/api`: NestJS API for content, auth, publishing, and future AI workflows.
- `packages/shared`: Shared TypeScript types, validation schemas, and constants.
- `packages/ui`: Shared UI components and shadcn/ui wrappers.
- `docs`: Product and technical documentation.

## Current Constraint

Do not add frontend or backend application code until the foundation is reviewed. This stage should remain limited to structure, documentation, and local infrastructure setup.

## Development Notes

- Prefer TypeScript throughout the monorepo when apps are scaffolded.
- Keep AI provider integrations behind clear service boundaries.
- Treat vector database integration as a later RAG layer, not part of the initial CMS core.
- Keep secrets out of source control. Use `.env.example` for documented variables only.

## Green Code Standards

All code contributions must follow the Green Code Policy documented in `docs/GREEN_CODE_POLICY.md`.

Key rules for AI agents and contributors:

1. **Database queries**: Always use `select` for specific fields, always paginate with `take`, always filter `deletedAt: null`.
2. **API responses**: Return only necessary data. No unbounded lists.
3. **AI usage**: Use the AI Router for model selection. Prefer free models. Log all usage. Never auto-publish AI output.
4. **External requests**: Always set timeouts. Limit concurrent requests. Handle failures gracefully.
5. **Frontend**: Use server components where possible. Lazy-load heavy components. No polling.
6. **Security**: Sanitize all user input. Auth checks before expensive operations. No secrets in responses.
7. **Testing**: No real external HTTP calls in tests. Clean up test data.

## Code Review Requirements

Use `docs/GREEN_CODE_REVIEW_CHECKLIST.md` for all pull requests. Target 80%+ checklist compliance before merging.

## Documentation

When adding new modules or features:
- Add API documentation to README.md
- Create module-specific docs in `docs/`
- Add environment variables to `.env.example`
- Document permissions and role requirements
