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

The backend API lives in `apps/api`. The admin frontend lives in `apps/admin-web`.

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

## Admin Web

The admin web app lives in `apps/admin-web` and is a Next.js TypeScript application using Tailwind CSS, React Query, and shadcn/ui-style local components.

```text
apps/admin-web/
  src/app/          Next.js App Router routes and API proxies
  src/components/   Layout and shadcn/ui-style components
  src/hooks/        React Query auth hooks
  src/lib/          API client, cookie, and utility helpers
  src/types/        Shared frontend TypeScript types
```

Configure local admin environment variables:

```bash
cp apps/admin-web/.env.example apps/admin-web/.env.local
```

On Windows PowerShell:

```powershell
Copy-Item apps\admin-web\.env.example apps\admin-web\.env.local
```

The browser-facing API URL should point to the admin app so client code can call the secure Next.js API proxy:

```text
NEXT_PUBLIC_API_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001
```

Start the admin app:

```bash
npm run admin:dev
```

Open:

```text
http://localhost:3000/login
```

Default login:

```text
email: admin@example.com
password: Admin@12345
```

Login flow:

- `/login` validates email/password and calls `POST /api/auth/login`.
- The Next.js login route forwards credentials to the NestJS backend at `API_BASE_URL`.
- The returned JWT is stored in an httpOnly cookie.
- `/dashboard` fetches the logged-in user through `GET /api/auth/me`.

Protected routing:

- Next.js middleware checks the auth cookie before allowing `/dashboard`.
- Unauthenticated users are redirected to `/login`.
- A `401` from the auth client redirects the browser back to `/login`.

Protected routes:

```text
/dashboard
/pages
/pages/new
/pages/:id/edit
/pages/:id/preview
/blogs
/blogs/new
/blogs/:id/edit
/blogs/:id/preview
/workflow
/notifications
/media
/categories
/tags
```

Unauthenticated users are redirected to:

```text
/login
```

## Page Management

The first CMS feature slice supports authenticated page management in the NestJS API and the admin frontend.

Backend endpoints:

```text
GET    /pages
GET    /pages/:id
POST   /pages
PUT    /pages/:id
DELETE /pages/:id
POST   /pages/:id/submit
POST   /pages/:id/approve
POST   /pages/:id/publish
```

Page workflow:

```text
DRAFT -> SUBMITTED -> APPROVED -> PUBLISHED
```

`ARCHIVED` is used for soft-deleted pages. Published pages receive a `publishedAt` timestamp.

Role permissions:

```text
Editor       create drafts, edit drafts, submit drafts for review
Reviewer     approve submitted pages
Publisher    publish approved pages
Super Admin  perform all page actions
Admin/Viewer read page data only
```

The admin editor uses Tiptap and stores page content as HTML. Preview screens sanitize HTML with DOMPurify before rendering.

Manual test:

1. Start Docker services: `docker compose up -d mysql redis`
2. Start API: `npm run api:dev`
3. Start admin: `npm run admin:dev`
4. Login at `http://localhost:3000/login`
5. Open `http://localhost:3000/pages`
6. Create a page, save draft, submit for review, approve, publish, and preview it.

## Blog Management

Blog management follows the same authenticated workflow as pages and adds one category plus multiple tags per blog post.

Backend endpoints:

```text
GET    /blogs
GET    /blogs/:id
POST   /blogs
PUT    /blogs/:id
DELETE /blogs/:id
POST   /blogs/:id/submit
POST   /blogs/:id/approve
POST   /blogs/:id/publish

GET    /categories
POST   /categories
PUT    /categories/:id
DELETE /categories/:id

GET    /tags
POST   /tags
PUT    /tags/:id
DELETE /tags/:id
```

Blog workflow:

```text
DRAFT -> SUBMITTED -> APPROVED -> PUBLISHED
```

Role permissions:

```text
Editor       create drafts, edit drafts, submit drafts for review
Reviewer     approve submitted blogs
Publisher    publish approved blogs
Super Admin  perform all blog actions
Admin/Viewer read blog data only
```

Categories and tags are managed from:

```text
http://localhost:3000/categories
http://localhost:3000/tags
```

Manual blog test:

1. Start Docker services: `docker compose up -d mysql redis`
2. Start API: `npm run api:dev`
3. Start admin: `npm run admin:dev`
4. Login at `http://localhost:3000/login`
5. Create a category and tag
6. Open `http://localhost:3000/blogs/new`
7. Create a blog, save draft, submit, approve, publish, and preview it

## Media Library

The media module lets authenticated CMS users upload, search, preview, update, copy, and soft-delete image assets for reuse in pages and blogs.

Backend endpoints:

```text
GET    /media
GET    /media/:id
POST   /media/upload
PUT    /media/:id
DELETE /media/:id
```

Supported upload types:

```text
JPG, PNG, WebP, safe SVG
```

Upload limits and storage are configured with:

```text
MEDIA_UPLOAD_DIR=uploads/media
MAX_UPLOAD_SIZE_MB=5
PUBLIC_MEDIA_BASE_URL=http://localhost:3000/uploads/media
```

Files are stored locally under `uploads/media`, which is ignored by git. The NestJS API serves files from `/uploads/media/*`; the admin app also proxies `/uploads/media/*` so media URLs work in the browser while the API remains on `API_BASE_URL`.

Media security validation:

```text
- Requires JWT auth for all media API operations
- Validates MIME type and file extension
- Rejects executable file extensions
- Enforces MAX_UPLOAD_SIZE_MB
- Sanitizes stored file names
- Rejects SVG files with script, event handler, embedded object, or javascript URL patterns
- Soft deletes database records by setting deletedAt
```

Open the media library:

```text
http://localhost:3000/media
```

Manual admin test:

1. Start Docker services: `docker compose up -d mysql redis`
2. Run migrations: `npm run api:prisma:deploy`
3. Start API: `npm run api:dev`
4. Start admin: `npm run admin:dev`
5. Login at `http://localhost:3000/login`
6. Open `http://localhost:3000/media`
7. Upload an image, edit alt text/caption/folder, copy the URL, preview it, and delete it

Manual API upload test:

```bash
curl -X POST http://localhost:3001/media/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/image.png" \
  -F "altText=Hero image" \
  -F "caption=Homepage hero" \
  -F "folder=homepage"
```

Reusable frontend component:

```tsx
import { MediaPicker } from '@/components/media/media-picker';

<MediaPicker
  selectedUrl={featuredImage}
  onSelect={(media) => setFeaturedImage(media.fileUrl)}
/>;
```

## Workflow Approval and Notifications

The workflow module tracks page and blog status changes with comments, audit logs, history records, and in-app notifications.

Supported content types:

```text
PAGE
BLOG
```

Workflow statuses:

```text
DRAFT
SUBMITTED
UNDER_REVIEW
CHANGES_REQUESTED
APPROVED
PUBLISHED
ARCHIVED
```

Valid transitions:

```text
DRAFT -> SUBMITTED
CHANGES_REQUESTED -> SUBMITTED
SUBMITTED -> UNDER_REVIEW
SUBMITTED -> CHANGES_REQUESTED
UNDER_REVIEW -> CHANGES_REQUESTED
SUBMITTED -> APPROVED
UNDER_REVIEW -> APPROVED
APPROVED -> PUBLISHED
```

Role permissions:

```text
Editor       submit draft or changes requested content
Reviewer     mark submitted content under review, request changes, approve
Publisher    publish approved content
Super Admin  perform all workflow actions
Admin/Viewer read workflow history only
```

Workflow endpoints:

```text
GET  /workflow/history/:contentType/:contentId
POST /workflow/pages/:id/submit
POST /workflow/pages/:id/start-review
POST /workflow/pages/:id/request-changes
POST /workflow/pages/:id/approve
POST /workflow/pages/:id/publish
POST /workflow/blogs/:id/submit
POST /workflow/blogs/:id/start-review
POST /workflow/blogs/:id/request-changes
POST /workflow/blogs/:id/approve
POST /workflow/blogs/:id/publish
```

Backward-compatible page and blog workflow endpoints still work and route through the same workflow service:

```text
POST /pages/:id/submit
POST /pages/:id/approve
POST /pages/:id/publish
POST /blogs/:id/submit
POST /blogs/:id/approve
POST /blogs/:id/publish
```

Notification endpoints:

```text
GET   /notifications
GET   /notifications/unread-count
PATCH /notifications/:id/read
PATCH /notifications/read-all
```

Notification rules:

```text
Editor submits content      -> notify Reviewers and Super Admins
Reviewer requests changes   -> notify original author
Reviewer approves content   -> notify Publishers and Super Admins
Publisher publishes content -> notify original author
```

Admin screens:

```text
http://localhost:3000/workflow
http://localhost:3000/notifications
```

Manual workflow test:

1. Login at `http://localhost:3000/login`
2. Create a page or blog as an Editor or Super Admin
3. Submit it for review
4. Open `http://localhost:3000/workflow`
5. Mark it under review, request changes, approve, or publish based on your role
6. Open the page/blog preview to see workflow history
7. Open `http://localhost:3000/notifications` or the notification bell to review unread notifications

Manual API test:

```bash
curl http://localhost:3001/workflow/history/PAGE/PAGE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

curl -X POST http://localhost:3001/workflow/pages/PAGE_ID/request-changes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"comment\":\"Please tighten the intro.\"}"
```
# AI Content And SEO Assistant

The CMS now includes authenticated AI tools for page and blog editors. The NestJS API exposes `/ai/generate-content`, `/ai/rewrite-content`, `/ai/summarize-content`, `/ai/generate-faq`, `/ai/generate-seo`, `/ai/improve-seo`, `/ai/generate-alt-text`, and `/ai/usage`.

Configure AI locally with these environment variables:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
AI_MAX_TOKENS=1200
AI_TEMPERATURE=0.4
```

Supported providers are `openai` and `gemini`. To switch the whole AI layer to Google Gemini, set:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your-google-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

To switch back to OpenAI, set:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
```

Do not expose `OPENAI_API_KEY` to the frontend. The admin UI calls Next.js API routes under `/api/ai/*`, and those routes forward authenticated requests to the NestJS backend with the existing JWT cookie.

Do not expose `GEMINI_API_KEY` to the frontend either. Gemini uses the same backend provider abstraction, so the AI content assistant, AI SEO assistant, and chatbot all use the configured provider without frontend changes.

Every AI request is logged in `AIUsageLog` with the user, action, provider, model, prompt summary, token input/output, and created date. Admin and Super Admin users can view all logs at `/ai/usage`; other allowed CMS roles see their own logs.

Allowed AI roles are Editor, Reviewer, Publisher, Admin, and Super Admin. AI output is never auto-published; users can copy, insert, replace after confirmation, or apply generated SEO metadata manually.

Manual API test after signing in:

```bash
curl -X POST http://localhost:3001/ai/generate-seo \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"AI CMS\",\"content\":\"<p>AI-first content operations.</p>\"}"
```

Manual admin UI test:

1. Start the API and admin web app.
2. Sign in as `admin@example.com`.
3. Open `/pages/new` or `/blogs/new`.
4. Use the AI content assistant to generate or rewrite content.
5. Use the AI SEO assistant to generate metadata.
6. Open `/ai/usage` to confirm the request was logged.

# AI Chatbot And Lead Capture

The CMS now includes an MVP public chatbot backed by published CMS content and simple keyword/context retrieval. It does not use Qdrant, Pinecone, or another vector database yet.

Backend module:

- `apps/api/src/chatbot`: NestJS chatbot module, DTOs, public APIs, admin APIs, knowledge retrieval, settings, analytics, and lead capture.
- Public APIs:
  - `POST /chatbot/message`
  - `POST /chatbot/lead`
  - `GET /chatbot/public-settings`
- Admin APIs:
  - `GET /chatbot/conversations`
  - `GET /chatbot/conversations/:id`
  - `GET /chatbot/leads`
  - `GET /chatbot/settings`
  - `PUT /chatbot/settings`
  - `GET /chatbot/analytics`

Public website module:

- `apps/public-web` runs on port `3002`.
- The floating chatbot widget is mounted globally in the public layout.
- The browser calls public-web routes under `/api/chatbot/*`, and those routes forward to the NestJS backend with `PUBLIC_API_BASE_URL`.

Admin screens:

- `/chatbot`: analytics dashboard.
- `/chatbot/conversations`: conversation list and search.
- `/chatbot/conversations/:id`: full message transcript.
- `/chatbot/leads`: captured lead list and search.
- `/chatbot/settings`: enable/disable chatbot, edit greeting/fallback, enable lead capture, and set support email.

Knowledge retrieval:

- Only `PUBLISHED` pages and blogs are used.
- HTML is stripped before content is sent to the AI provider.
- The visitor question is tokenized and matched against published title/excerpt/content.
- The top matching sources are trimmed into a small context prompt.
- If no content matches, the configured fallback message is returned.

Lead capture:

- The chatbot suggests lead capture when it cannot answer from content or when the visitor asks about contact, demo, pricing, sales, or support.
- Leads store name, email, optional phone, message, source page, and a conversation link.
- Lead capture creates an audit log entry.

Future RAG upgrade path:

- Replace the keyword retrieval method in `ChatbotService` with a retrieval provider interface.
- Add a Qdrant/Pinecone implementation that indexes published page/blog chunks.
- Keep the public `/chatbot/message` contract unchanged while swapping the retrieval source.

Manual chatbot test:

```bash
docker compose up -d mysql redis
npm run api:prisma:deploy
npm run prisma:generate
npm run api:dev
npm run public:dev
```

Then open `http://localhost:3002`, click the floating chat button, ask a question that matches a published page or blog, and submit the lead form when prompted.

# Admin Dashboard Analytics

The admin dashboard now uses a NestJS dashboard module to provide role-aware CMS analytics.

Backend:

- `GET /dashboard/summary`
- `GET /dashboard/content-stats`
- `GET /dashboard/ai-stats`
- `GET /dashboard/chatbot-stats`
- `GET /dashboard/recent-activity`

The summary response includes page/blog counts, media and user counts, pending workflow items, AI request totals, chatbot conversations, leads, recent audit activity, recent pages, recent blogs, and recent leads.

Role visibility:

- Admin and Super Admin see full system analytics.
- Editors see their own authored page/blog stats where practical.
- Reviewers see review queue content.
- Publishers see approved content waiting for publish.
- Viewers get a read-only content overview.

Admin UI:

- `/dashboard` shows responsive stat cards, quick actions, recent activity, recent pages, recent blogs, recent leads, and system overview cards.
- Reusable components live in `apps/admin-web/src/components/dashboard`.
- Sidebar navigation now includes Dashboard, Pages, Blogs, Categories, Tags, Media, Workflow, AI Usage, Chatbot, Leads, Notifications, and Settings.

Manual test:

```bash
npm run api:build
npm run admin:build
npm run api:dev
npm run admin:dev
```

Then sign in and open `http://localhost:3000/dashboard`.
