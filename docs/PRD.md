# Product Requirements Document

## Product Summary

The AI CMS Platform is an MVP for creating, managing, publishing, and eventually enhancing content with AI-assisted workflows.

## Goals

- Provide a clean foundation for an admin CMS and public web experience.
- Support structured content management backed by MySQL.
- Prepare for AI-assisted content creation and editing.
- Prepare for future chatbot/RAG capabilities over published content.

## Completed Foundation Slices

- Monorepo structure and local infrastructure.
- NestJS API foundation with health checks and Swagger.
- Prisma/MySQL schema, migrations, and seed data.
- JWT authentication and role-based authorization.
- Admin frontend login and protected dashboard.
- Page management with draft, review, approval, publish, and preview.
- Blog management with categories, tags, draft, review, approval, publish, and preview.

## Non-Goals for Current Slice

- No media upload implementation yet.
- No AI provider integration yet.
- No vector database integration yet.

## Primary Users

- CMS admins who create and manage content.
- Editors who draft, review, and publish content.
- Public visitors who consume published content.

## MVP Capabilities Later

- Content models and entries.
- Draft and publish workflow.
- Admin dashboard.
- Public content rendering.
- API-backed content delivery.
- AI-assisted generation and editing.

## Future Capabilities

- Chatbot over published content.
- Embeddings and semantic search.
- Multi-tenant workspace support.
- Role-based access control.
- Scheduled publishing.
