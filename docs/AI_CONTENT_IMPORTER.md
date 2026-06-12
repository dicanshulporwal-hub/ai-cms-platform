# AI Content Importer

The AI Content Importer is the admin workflow for turning Word documents and approved public web pages into CMS review items. It is designed as a gated import pipeline: extraction creates reviewable candidates, approval creates CMS drafts, and publishing remains a separate editorial action.

## Admin Routes

- `/ai/content-importer`: Import dashboard and recent jobs.
- `/ai/content-importer/word-import`: Upload `.docx` files and run Word extraction.
- `/ai/content-importer/web-import`: Create single URL, URL batch, or sitemap import jobs.
- `/ai/content-importer/jobs`: Browse import jobs.
- `/ai/content-importer/jobs/:id`: Inspect extracted items, assets, and logs for a job.
- `/ai/content-importer/review/:jobId`: Approve or skip generated import items.
- `/ai/content-importer/rules`: Manage deterministic mapping rules.
- `/ai/content-importer/logs`: Review importer audit logs.

## API Surface

- `GET /content-importer/summary`
- `POST /content-importer/jobs/upload-word`
- `POST /content-importer/jobs/import-url`
- `POST /content-importer/jobs/import-url-batch`
- `POST /content-importer/jobs/import-sitemap`
- `POST /content-importer/web/validate-url`
- `GET /content-importer/jobs`
- `GET /content-importer/jobs/:id`
- `POST /content-importer/jobs/:id/extract`
- `POST /content-importer/jobs/:id/fetch-web`
- `POST /content-importer/jobs/:id/reprocess`
- `POST /content-importer/jobs/:id/import-approved`
- `POST /content-importer/items/:id/approve`
- `POST /content-importer/items/:id/import`
- `POST /content-importer/items/:id/skip`
- `GET /content-importer/rules`
- `POST /content-importer/rules`
- `GET /content-importer/logs`

The admin web app calls these endpoints through `/api/content-importer/*`, which proxies requests to the API app.

## Data Model

The importer uses dedicated tables so extracted content can be reviewed without mutating live CMS records:

- `content_import_jobs`: Source metadata, current status, warnings, extracted preview, and source options.
- `content_import_items`: Reviewable content candidates with target module mapping.
- `content_import_assets`: Extracted or referenced images and attachments.
- `content_import_rules`: Deterministic title, URL, and domain mapping rules.
- `content_import_logs`: Operational and audit trail events.

All job, item, and rule lists filter `deletedAt: null`, select explicit fields, and paginate results.

## Permissions

The module key is `content_importer`. Permission names follow the existing role system:

- `content_importer.view`
- `content_importer.upload`
- `content_importer.word_import`
- `content_importer.web_import`
- `content_importer.web_validate`
- `content_importer.web_batch_import`
- `content_importer.web_sitemap_import`
- `content_importer.web_image_import`
- `content_importer.extract`
- `content_importer.ai_analyze`
- `content_importer.review`
- `content_importer.approve_item`
- `content_importer.import_item`
- `content_importer.import_bulk`
- `content_importer.cancel_job`
- `content_importer.delete_job`
- `content_importer.rules.view`
- `content_importer.rules.create`
- `content_importer.rules.update`
- `content_importer.rules.delete`
- `content_importer.logs.view`

## Green Code Notes

- Extraction jobs are explicit user actions; the admin UI does not poll.
- External web requests use timeouts, redirect limits, byte limits, and private-network blocking.
- Word extraction runs locally and does not send document content to external services.
- Generated items stay in review states until an editor approves them. Approval from the review screen starts draft import, never publication.
- AI enhancement should use the AI Router, usage logging, and free-model preference before any future content rewriting or classification is enabled.
