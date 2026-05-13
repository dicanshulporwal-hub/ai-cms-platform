# AI CMS Platform

AI-first CMS MVP foundation for managing content, publishing public pages, and preparing for future AI authoring and chatbot/RAG features.

## Planned Stack

- Next.js for admin and public web apps
- NestJS for the API
- MySQL 8 for relational data
- Prisma for database access and migrations
- Redis for caching, queues, and short-lived state
- Tailwind CSS and shadcn/ui for UI foundations
- TypeScript across apps and packages
- OpenAI or Gemini for AI features later
- Qdrant or Pinecone for chatbot RAG later

## Monorepo Structure

```text
apps/
  admin-web/
  public-web/
  api/
packages/
  shared/
  ui/
docs/
```

No frontend or backend application code has been generated yet. This repository currently contains only the initial project foundation.

## Backend API

The backend API lives in `apps/api` and is a NestJS TypeScript application. The initial API includes environment validation, Prisma configured for MySQL, and a health endpoint.

```text
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

## Local Infrastructure

Start MySQL and Redis:

```bash
docker compose up -d mysql redis
```

View service logs:

```bash
docker compose logs -f mysql redis
```

Stop services:

```bash
docker compose down
```

## API Commands

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Generate Prisma Client:

```bash
npm run api:prisma:generate
```

Run local database migrations later, after models are added:

```bash
npm run api:prisma:migrate
```

Start the API locally:

```bash
npm run api:dev
```
