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

The admin frontend uses `NEXT_PUBLIC_API_URL` for browser requests to its own proxy routes and `API_BASE_URL` for server-side proxy requests to the NestJS backend.

Admin page management proxy routes mirror the backend `/pages` endpoints under `/api/pages`.

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

Implemented page management endpoints:

- `GET /pages`: list pages with `page`, `limit`, `search`, and `status` query params.
- `GET /pages/:id`: get one page.
- `POST /pages`: create a draft page.
- `PUT /pages/:id`: update a page.
- `DELETE /pages/:id`: soft delete a page as `ARCHIVED`.
- `POST /pages/:id/submit`: submit a draft for review.
- `POST /pages/:id/approve`: approve a submitted page.
- `POST /pages/:id/publish`: publish an approved page and set `publishedAt`.

Page statuses:

```text
DRAFT
SUBMITTED
UNDER_REVIEW
APPROVED
PUBLISHED
ARCHIVED
```

Page permissions:

```text
Editor       create drafts, edit drafts, submit drafts
Reviewer     approve submitted pages
Publisher    publish approved pages
Super Admin  all page actions
Admin/Viewer read only
```

Page request fields:

```json
{
  "title": "About Us",
  "slug": "about-us",
  "content": "<p>HTML content</p>",
  "excerpt": "Short summary",
  "featuredImage": "https://example.com/image.jpg",
  "metaTitle": "About Us",
  "metaDescription": "Learn more about us."
}
```

Slug values must be URL-friendly and unique. `metaTitle` is limited to 60 characters and `metaDescription` to 160 characters.

Future content areas:

- Content type management.
- Public content delivery.

### Blogs

- `GET /blogs`: list blogs with `page`, `limit`, `search`, `status`, `categoryId`, and `tagId` query params.
- `GET /blogs/:id`: get one blog.
- `POST /blogs`: create a draft blog.
- `PUT /blogs/:id`: update a blog.
- `DELETE /blogs/:id`: soft delete a blog as `ARCHIVED`.
- `POST /blogs/:id/submit`: submit a draft for review.
- `POST /blogs/:id/approve`: approve a submitted blog.
- `POST /blogs/:id/publish`: publish an approved blog and set `publishedAt`.

Blog request fields:

```json
{
  "title": "How AI Changes CMS Workflows",
  "slug": "how-ai-changes-cms-workflows",
  "content": "<p>HTML content</p>",
  "excerpt": "Short summary",
  "featuredImage": "https://example.com/image.jpg",
  "categoryId": "category-id",
  "tagIds": ["tag-id"],
  "metaTitle": "How AI Changes CMS Workflows",
  "metaDescription": "A concise search description."
}
```

Blog slugs are unique and URL-friendly. Blogs support one optional category and multiple tags.

### Categories

- `GET /categories`: list active categories.
- `POST /categories`: create a category.
- `PUT /categories/:id`: update a category.
- `DELETE /categories/:id`: soft delete a category.

### Tags

- `GET /tags`: list active tags.
- `POST /tags`: create a tag.
- `PUT /tags/:id`: update a tag.
- `DELETE /tags/:id`: soft delete a tag.

Admin blog, category, and tag proxy routes mirror these backend endpoints under `/api/blogs`, `/api/categories`, and `/api/tags`.

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
