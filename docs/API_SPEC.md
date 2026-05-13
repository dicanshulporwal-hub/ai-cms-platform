# API Spec

## Status

The initial NestJS API foundation is in place. Authentication and CMS domain endpoints are not implemented yet.

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
