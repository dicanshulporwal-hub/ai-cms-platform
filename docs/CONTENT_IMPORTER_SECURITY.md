# Content Importer Security

The Content Importer handles untrusted files, public web pages, and generated CMS candidates. Security defaults should favor bounded processing, explicit review, and minimal returned data.

## File Uploads

- Accept only `.docx` Word packages for Word import.
- Enforce `MAX_CONTENT_IMPORT_FILE_SIZE_MB`.
- Store uploads under `CONTENT_IMPORT_UPLOAD_DIR`.
- Do not execute document content or macros.
- Extract media to job-scoped directories.
- Keep original file names as metadata only.

## External Requests

- Use explicit timeouts and response byte limits.
- Block localhost, private, link-local, multicast, and documentation IP ranges.
- Block internal hostnames before DNS lookup.
- Re-check each redirect target.
- Limit redirect depth.
- Do not run tests against real external HTTP services.

## Content Sanitization

- Strip scripts, styles, inline event handlers, and unsafe URLs from fetched HTML.
- Treat extracted titles, summaries, links, image alt text, and table content as untrusted input.
- Return selected fields only in list APIs.
- Paginate every job, rule, item, asset, and log list.

## Review And Publishing

- Extraction creates review records, not live content.
- Approval can start draft import for supported mappings; it must not publish content.
- Import actions must create drafts only unless a separate CMS workflow approves publication.
- AI-generated or AI-rewritten text must never auto-publish.

## Auditing

- Log source creation, extraction, fetches, review actions, warnings, and failures.
- Preserve job warnings and extraction metadata for editorial traceability.
- Keep secrets out of logs and responses.
