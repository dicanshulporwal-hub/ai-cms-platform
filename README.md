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

The admin dashboard provides role-aware CMS analytics with a polished, responsive UI.

## Backend APIs

All dashboard endpoints require JWT authentication and are protected by role guards.

```text
GET /dashboard/summary        - Full dashboard summary
GET /dashboard/content-stats  - Page and blog statistics
GET /dashboard/ai-stats       - AI usage statistics
GET /dashboard/chatbot-stats  - Chatbot and lead statistics
GET /dashboard/recent-activity - Recent audit log entries
```

## Dashboard Summary Response

```json
{
  "totalPages": 25,
  "publishedPages": 15,
  "draftPages": 8,
  "submittedPages": 2,
  "totalBlogs": 30,
  "publishedBlogs": 20,
  "draftBlogs": 5,
  "submittedBlogs": 5,
  "totalMedia": 100,
  "totalUsers": 12,
  "pendingWorkflowItems": 7,
  "totalAIRequests": 150,
  "totalChatbotConversations": 45,
  "totalLeads": 23,
  "recentActivities": [...],
  "recentPages": [...],
  "recentBlogs": [...],
  "recentLeads": [...],
  "scope": "system"
}
```

## Role-Based Dashboard Visibility

| Role | Scope | What They See |
|------|-------|---------------|
| Super Admin | `system` | Full system analytics, all users, all leads |
| Admin | `system` | Full system analytics, all users, all leads |
| Editor | `own_content` | Only their authored pages/blogs, their AI usage |
| Reviewer | `review_queue` | Content submitted for review, pending items |
| Publisher | `publish_queue` | Approved content waiting to publish |
| Viewer | `read_only` | Read-only content overview |

## Frontend Components

All dashboard components are reusable and located in `apps/admin-web/src/components/dashboard/`:

- **StatCard** - Metric card with icon, label, value, and optional trend
- **DashboardSection** - Card wrapper with icon, title, description
- **QuickActionCard** - Clickable action card for common tasks
- **RecentActivityList** - Formatted list of audit log entries
- **RecentContentList** - List of recent pages/blogs with status badges
- **RecentLeadsList** - List of recently captured leads
- **EmptyState** - Empty data placeholder with optional icon
- **LoadingSkeleton** - Animated loading placeholder

## Quick Actions

Quick actions are role-based shortcuts:

- **Editor+**: Create Page, Create Blog, Upload Media
- **Reviewer/Publisher+**: View Workflow
- **Admin+**: View Chatbot Leads
- **All roles**: AI Usage

## Manual Testing

1. Start services:
   ```bash
   docker compose up -d mysql redis
   npm run api:dev
   npm run admin:dev
   ```

2. Login as different roles to test scope visibility:
   - Super Admin: `admin@example.com` / `Admin@12345`
   - Create test users with different roles

3. Navigate to `http://localhost:3000/dashboard`

4. Verify:
   - Stats cards show correct counts
   - Quick actions match role permissions
   - Recent sections show appropriate data
   - System Overview only visible to Admin+

# User Management and Settings

The CMS includes user management and system settings modules for Super Admin and Admin users.

## User Management

Backend endpoints:

```text
GET    /users                      List users (paginated, searchable, filterable)
GET    /users/:id                  Get user by ID
POST   /users                      Create new user
PUT    /users/:id                  Update user details
PATCH  /users/:id/status           Activate/deactivate user
DELETE /users/:id                  Soft delete user
```

User fields:

```text
id        string (auto-generated CUID)
name      string (required)
email     string (required, unique)
password  string (required on create, min 8 chars, hashed with bcrypt)
roleId    string (required)
status    enum: ACTIVE | INACTIVE (default: ACTIVE)
createdAt DateTime
updatedAt DateTime
```

Role hierarchy and permissions:

```text
Super Admin  - Full access to all users and settings
Admin        - Can create/manage Editor, Reviewer, Publisher, Viewer users
Editor       - Can create/edit content
Reviewer     - Can review and approve content
Publisher    - Can publish approved content
Viewer       - Read-only access
```

User creation rules:

- Super Admin can create any role
- Admin can create Editor, Reviewer, Publisher, Viewer (not Super Admin or Admin)
- Email must be unique across the platform
- Password is hashed before storage
- Users cannot delete or deactivate their own account
- Admin cannot edit or delete Super Admin users

Admin screens:

```text
/users           User list with search, filter by role/status
/users/new       Create new user form
/users/:id/edit  Edit user form
```

## Role Permissions

Backend endpoints:

```text
GET  /roles                    List all roles
GET  /roles/:id                Get role by ID
PUT  /roles/:id/permissions    Update role permissions (Super Admin only)
```

Role permissions are stored as JSON and can be configured by Super Admin users. The permissions object structure:

```json
{
  "blogs": ["read", "create", "update", "delete"],
  "pages": ["read", "create", "update", "delete"],
  "media": ["read", "upload", "delete"],
  "users": ["read"],
  "settings": ["read"]
}
```

## System Settings

Backend endpoints:

```text
GET  /settings     Get all settings
PUT  /settings     Update settings
```

Settings fields:

```text
siteName              string     Site display name
siteDescription       string?    Site description/summary
siteLogo              string?    URL to site logo
defaultMetaTitle      string?    Default SEO title (max 60 chars)
defaultMetaDescription string?   Default SEO description (max 160 chars)
supportEmail          string?    Support contact email
chatbotEnabled        boolean    Enable/disable public chatbot
aiEnabled             boolean    Enable/disable AI features
maintenanceMode       boolean    Put site in maintenance mode
```

Critical settings (Super Admin only):

```text
maintenanceMode
aiEnabled
chatbotEnabled
```

Admin users can update non-critical settings (site name, description, logo, SEO defaults, support email).

Admin screen:

```text
/settings    Site settings form with all configuration options
```

## Audit Logs

All user and settings changes are logged to the audit log:

```text
user.created           New user created
user.updated           User details updated
user.status_changed    User activated/deactivated
user.deleted           User soft deleted
role.permissions_updated  Role permissions changed
settings.updated       Settings changed
```

## Manual Testing

### Test User Creation

1. Login as Super Admin (`admin@example.com` / `Admin@12345`)
2. Open `http://localhost:3000/users`
3. Click "Create User"
4. Fill in name, email, password, and select a role
5. Save and verify the user appears in the list
6. Try to create a user with the same email (should fail)
7. Login as the new user to verify credentials work

### Test User Editing

1. As Admin, try to edit a user you created
2. Verify you cannot edit Super Admin users
3. Verify you cannot edit your own account from the users page
4. Test role assignment restrictions (Admin cannot assign Super Admin role)

### Test User Status Change

1. Deactivate a user from the users list
2. Try to login as that user (should fail with "inactive" message)
3. Reactivate the user
4. Login should work again

### Test User Deletion

1. Try to delete your own account (should be blocked)
2. As Admin, try to delete a Super Admin (should be blocked)
3. Delete a user you created
4. Verify soft delete (user removed from list but database record has deletedAt)

### Test Settings Update

1. As Super Admin, open `http://localhost:3000/settings`
2. Update site name and description
3. Toggle maintenance mode, AI enabled, chatbot enabled
4. Save and verify changes persist
5. Login as Admin
6. Verify you can edit non-critical settings
7. Verify critical toggles are disabled for Admin

### Test API Directly

```bash
# List users
curl http://localhost:3001/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create user
curl -X POST http://localhost:3001/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123","roleId":"ROLE_CUID"}'

# Update user status
curl -X PATCH http://localhost:3001/users/USER_CUID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"INACTIVE"}'

# Get settings
curl http://localhost:3001/settings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Update settings
curl -X PUT http://localhost:3001/settings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"siteName":"My AI CMS","aiEnabled":true}'
```

## Social Media Publishing

The Social Media module provides an MVP workflow for managing social accounts and preparing posts for publishing.

Admin screen:

```text
/social-media
```

Backend endpoints:

```text
GET    /social-media/summary
GET    /social-media/accounts
GET    /social-media/accounts/:id
POST   /social-media/accounts
PUT    /social-media/accounts/:id
DELETE /social-media/accounts/:id

GET    /social-media/posts
GET    /social-media/posts/:id
POST   /social-media/posts
PUT    /social-media/posts/:id
DELETE /social-media/posts/:id
POST   /social-media/posts/:id/submit
POST   /social-media/posts/:id/approve
POST   /social-media/posts/:id/queue
POST   /social-media/posts/:id/publish
POST   /social-media/posts/:id/cancel

GET    /social-media/settings
PUT    /social-media/settings
```

Workflow:

```text
Draft -> Pending Approval -> Approved -> Queued -> Published
```

For the MVP, `publish` records a simulated publish result and writes publish logs. It does not call Facebook, LinkedIn, X, Instagram, or other external social APIs yet. Real provider integrations can be added later behind a provider service without changing the admin workflow.

Manual testing:

1. Login as Super Admin or Admin.
2. Open `http://localhost:3000/social-media`.
3. Add a social account with platform key like `linkedin`.
4. Create a draft post and select that account.
5. Submit, approve, and publish the post.
6. Verify the post status changes and target publish status is shown.

## Green Code & Performance

This project follows Green Code principles for energy-efficient, resource-conscious development. See the documentation in `docs/` for full details:

| Document | Purpose |
|----------|---------|
| [GREEN_CODE_POLICY.md](docs/GREEN_CODE_POLICY.md) | Core principles and anti-patterns |
| [GREEN_CODE_REVIEW_CHECKLIST.md](docs/GREEN_CODE_REVIEW_CHECKLIST.md) | PR review checklist |
| [AI_GREEN_CODE_GUIDELINES.md](docs/AI_GREEN_CODE_GUIDELINES.md) | Rules for AI-generated code |
| [DATABASE_PERFORMANCE.md](docs/DATABASE_PERFORMANCE.md) | Query optimization and indexing |

Key principles:
- Minimize unnecessary computation and database queries
- Paginate all list endpoints
- Use `select` for specific fields instead of fetching full records
- Set timeouts on all external HTTP requests
- Prefer free AI models for non-critical tasks
- Cache where appropriate, disable caching in development
- Lazy-load frontend components not immediately visible
- Validate input early to fail fast and save resources
