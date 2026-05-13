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

The backend API has been started under `apps/api`. Frontend applications have not been generated yet.

## Backend API

The backend API lives in `apps/api` and is a NestJS TypeScript application. The API includes environment validation, Prisma configured for MySQL, JWT authentication, role-based guards, Swagger docs, and a health endpoint.

```text
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

Swagger/OpenAPI docs are available after the API starts:

```text
http://localhost:3001/docs
```

## Authentication

Default seeded Super Admin:

```text
email: admin@example.com
password: Admin@12345
```

Login:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"Admin@12345\"}"
```

Use the returned JWT as a bearer token:

```bash
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Protected route example:

```bash
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Role-protected route example:

```bash
curl http://localhost:3001/auth/admin-only \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
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
npm run prisma:generate
```

Run local database migrations:

```bash
npm run prisma:migrate -- --name migration_name
```

Seed default roles and Super Admin:

```bash
npm run prisma:seed
```

Start the API locally:

```bash
npm run api:dev
```
