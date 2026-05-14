# Architecture

## Overview

This repository is structured as a monorepo with separate applications and shared packages. The initial foundation intentionally avoids app code while establishing where each part of the platform will live.

## Applications

### `apps/admin-web`

Next.js admin application for CMS admins and editors. It uses Tailwind CSS, shadcn/ui-style local components, React Query, and Next.js middleware for protected routes.

### `apps/public-web`

Planned Next.js application for public content rendering.

### `apps/api`

NestJS API for content management, publishing, authentication, and future AI workflows. The app includes environment validation, Prisma setup, JWT authentication, role-based guards, Swagger docs, and `GET /health`.

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

Prisma will be used later for schema management, migrations, and database access from the NestJS API.
The Prisma schema is located at `apps/api/prisma/schema.prisma` and is configured for MySQL through `DATABASE_URL`.

## Auth Layer

Authentication uses email/password login, bcrypt password hashing, and JWT access tokens. Authorization is handled with route guards and role metadata. Refresh tokens and OAuth are intentionally out of scope for the MVP auth slice.

The admin web app stores JWTs in an httpOnly cookie set by its own Next.js API routes. Browser code calls the admin app's `/api/auth/*` routes, and those routes proxy authenticated requests to the NestJS backend.

## AI Layer

OpenAI or Gemini integrations will be added later behind API service boundaries. AI features should not be coupled directly to UI components.

## RAG Layer

Qdrant or Pinecone can be introduced later for embeddings, semantic retrieval, and chatbot features over approved content.
