# Architecture

## Overview

This repository is structured as a monorepo with separate applications and shared packages. The current foundation includes the backend API, authentication, Prisma/MySQL setup, the admin auth/dashboard slice, page management, and blog management.

## Applications

### `apps/admin-web`

Next.js admin application for CMS admins and editors. It uses Tailwind CSS, shadcn/ui-style local components, React Query, and Next.js middleware for protected routes.

Key folders:

```text
src/app
src/components
src/hooks
src/lib
src/types
```

### `apps/public-web`

Planned Next.js application for public content rendering.

### `apps/api`

NestJS API for content management, publishing, authentication, and future AI workflows. The app includes environment validation, Prisma setup, JWT authentication, role-based guards, Swagger docs, and `GET /health`.

The `pages` module owns page CRUD, workflow transitions, pagination/filtering, and audit logs. The `blogs` module owns blog CRUD, category/tag management, workflow transitions, pagination/filtering, and audit logs.

## Packages

### `packages/shared`

Planned shared package for TypeScript types, constants, validation schemas, and cross-app utilities.

### `packages/ui`

Planned shared UI package for Tailwind CSS and shadcn/ui components.

## Infrastructure

### MySQL 8

Primary relational database for CMS content, users, settings, and publishing state.

### Redis

Planned for caching, queues, rate limiting, sessions, and short-lived workflow state.

## Data Layer

Prisma is used for schema management, migrations, and database access from the NestJS API. The Prisma schema is located at `apps/api/prisma/schema.prisma` and is configured for MySQL through `DATABASE_URL`.

## Auth Layer

Authentication uses email/password login, bcrypt password hashing, and JWT access tokens. Authorization is handled with route guards and role metadata. Refresh tokens and OAuth are intentionally out of scope for the MVP auth slice.

The admin web app stores JWTs in an httpOnly cookie set by its own Next.js API routes. Browser code calls the admin app's `/api/auth/*` routes using `NEXT_PUBLIC_API_URL`, and those routes proxy authenticated requests to the NestJS backend using `API_BASE_URL`.

## Page Workflow

Pages move from `DRAFT` to `SUBMITTED`, then `APPROVED`, then `PUBLISHED`. Editors create and submit drafts, Reviewers approve submitted pages, Publishers publish approved pages, and Super Admins can perform every transition. Page deletes are soft deletes using `deletedAt` and `ARCHIVED`.

The admin editor uses Tiptap and saves HTML into MySQL. Preview rendering sanitizes HTML in the browser with DOMPurify before using `dangerouslySetInnerHTML`.

## Blog And Taxonomy

Blogs use the same `ContentStatus` workflow as pages and store HTML content from Tiptap. Each blog can have one optional category through `categoryId` and multiple tags through the existing many-to-many relation. Blog, category, and tag deletes are soft deletes using `deletedAt` where applicable.

## AI Layer

OpenAI or Gemini integrations will be added later behind API service boundaries. AI features should not be coupled directly to UI components.

## RAG Layer

Qdrant or Pinecone can be introduced later for embeddings, semantic retrieval, and chatbot features over approved content.
