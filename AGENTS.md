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
