# API Spec

## Status

The initial NestJS API foundation is in place with JWT authentication, role-based authorization, Prisma, and health checks. CMS domain CRUD endpoints are not implemented yet.

## Base Path

```text
/
```

## Future Resource Areas

### Health

- `GET /health`: service health check.

Response:

```json
{
  "status": "ok"
}
```

### Auth

- `POST /auth/login`: login with email and password.
- `GET /auth/me`: return the authenticated user. Requires bearer token.
- `POST /auth/logout`: stateless logout acknowledgement. Requires bearer token.
- `GET /auth/admin-only`: protected role-based authorization example. Requires `Super Admin` or `Admin`.

The admin web app also exposes proxy routes:

- `POST /api/auth/login`: forwards login to the backend and stores the JWT in an httpOnly cookie.
- `GET /api/auth/me`: forwards the current cookie token to the backend.
- `POST /api/auth/logout`: clears the admin auth cookie.

Login request:

```json
{
  "email": "admin@example.com",
  "password": "Admin@12345"
}
```

Login response:

```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "Super Admin",
    "email": "admin@example.com",
    "role": "Super Admin"
  }
}
```

### Roles

- `GET /roles`: list roles. Requires `Super Admin` or `Admin`.

### Content

- Content type management.
- Content entry CRUD.
- Draft and publish actions.
- Public content delivery.

### Media

- Media upload and metadata management.

### AI

- AI-assisted content generation.
- AI-assisted editing.
- Content summarization.

### Search and RAG

- Embedding generation.
- Semantic search.
- Chatbot retrieval endpoints.

## API Principles

- Keep admin-only and public endpoints clearly separated.
- Validate all input with shared schemas where practical.
- Keep provider-specific AI logic behind internal services.
- Version public APIs before external consumption.
