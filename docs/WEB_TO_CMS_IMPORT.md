# Web To CMS Import

Web import creates CMS review items from approved public URLs. It supports a single page, a small batch of page URLs, or sitemap discovery followed by selected page extraction.

## Source Types

- `WEB_URL`: Fetch and extract one public page.
- `WEB_PAGE_BATCH`: Fetch and extract a bounded list of public pages.
- `WEB_SITEMAP`: Fetch a sitemap and stage same-domain URLs for review; selected URLs can then be fetched.

## Request Safety

The importer applies defensive checks before and during fetches:

- Only `http` and `https` URLs are accepted.
- Localhost, private IP ranges, and internal hostnames are blocked.
- DNS results are checked before requests.
- Redirects are followed manually with a fixed cap.
- Requests use `CONTENT_IMPORT_FETCH_TIMEOUT_MS`.
- Responses are capped by `CONTENT_IMPORT_MAX_RESPONSE_BYTES`.
- Sitemap URL counts are capped and restricted to the source domain unless the user chooses otherwise.
- Robots.txt checks are supported through the job options.

## Extraction

HTML extraction removes scripts, styles, noscript blocks, inline event handlers, and dangerous URLs before creating structured review data. The importer captures:

- Title, meta description, canonical URL, and Open Graph metadata.
- Headings and paragraph text.
- Tables.
- Links.
- Image references with alt text.

Images are stored as asset references by default. Downloading remote images should continue to use bounded requests and review states.

## Mapping

Web pages become `content_import_items` with `REVIEW_REQUIRED` status. The importer can use deterministic rules to map by URL, title, or domain. When no rule matches, the safe fallback is a page-like item that remains unmapped or mapped to the enabled `pages` module. Approved `pages` mappings create CMS page drafts only; remaining unreviewed items keep the import job partially completed.

## Compliance

Users must confirm they have permission to import web content before a job is created. Imported content remains in review and must not be auto-published.
