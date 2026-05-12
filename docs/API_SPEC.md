# API Spec

## Status

No API endpoints are implemented yet. This document captures the planned API surface for the future NestJS service.

## Planned Base Path

```text
/api
```

## Future Resource Areas

### Health

- `GET /api/health`: service health check.

### Auth

- Authentication and session endpoints to be defined later.

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
