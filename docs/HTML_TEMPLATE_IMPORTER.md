# HTML Template Importer

## Overview

The HTML Template Importer allows Admin/Super Admin users to convert freely available HTML templates into CMS-compatible templates with automatic region detection, safety validation, and license tracking.

## Import Methods

### Method A: Upload ZIP
- Upload a ZIP file containing HTML, CSS, images, and fonts
- System extracts and validates all files
- Dangerous file types are rejected (.exe, .bat, .php, etc.)
- JavaScript files are blocked unless `TEMPLATE_ALLOW_IMPORTED_JS=true`

### Method B: Paste HTML/CSS
- Paste raw HTML code directly
- Optionally paste CSS
- Instant analysis and conversion
- No file upload needed

## Supported File Types
- HTML: .html, .htm
- CSS: .css
- Images: .png, .jpg, .jpeg, .webp, .svg
- Fonts: .woff, .woff2, .ttf, .eot
- Other: .json, .ico, .txt, .md

## Rejected File Types
- .exe, .bat, .cmd, .ps1, .sh, .php, .jsp, .asp, .aspx, .py, .rb, .java, .dll

## Region Detection Logic

The analyzer parses HTML and detects layout regions:

| HTML Element | Detected Region |
|---|---|
| `<header>` | HEADER |
| `<nav>` | NAVIGATION |
| `<main>` | CONTENT |
| `<footer>` | FOOTER |
| `.hero` / `#hero` | HERO (CONTENT type) |
| `.sidebar` / `<aside>` | SIDEBAR |

If no regions are detected, defaults are created: header, navigation, main, footer.

## Conversion Flow

1. HTML is sanitized (scripts removed, event handlers stripped, unsafe URLs cleaned)
2. Regions are detected from HTML structure
3. CMS region placeholders are inserted
4. template.json is generated with regions and default module mappings
5. CSS is preserved with skip-link styles added
6. Result is saved as a CONVERTED import job

## Security

- All imported HTML is treated as untrusted input
- Script tags are removed
- Event handlers (onclick, onload, etc.) are stripped
- javascript: URLs are neutralized
- Unsafe iframes/embeds/objects are removed
- JavaScript files are blocked by default
- ZIP files are checked for path traversal

## License Requirements

When `TEMPLATE_REQUIRE_LICENSE_INFO=true` (default):
- Source URL is required before saving as template
- License name is required before saving as template
- License info is stored with the template

## Environment Variables

```
TEMPLATE_IMPORT_UPLOAD_DIR=uploads/template-imports
MAX_TEMPLATE_IMPORT_SIZE_MB=25
TEMPLATE_ALLOW_IMPORTED_JS=false
TEMPLATE_REQUIRE_LICENSE_INFO=true
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /templates/import-html/upload | Upload ZIP template |
| POST | /templates/import-html/paste | Paste HTML/CSS code |
| GET | /templates/import-html/jobs | List import jobs |
| GET | /templates/import-html/jobs/:id | Get job details |
| POST | /templates/import-html/jobs/:id/convert | Convert to CMS format |
| POST | /templates/import-html/jobs/:id/save-as-template | Save as draft template |
| DELETE | /templates/import-html/jobs/:id | Delete import job |

## Admin Routes

- `/templates/import-html` — Choose import method
- `/templates/import-html/upload` — Upload ZIP
- `/templates/import-html/paste` — Paste HTML/CSS
- `/templates/import-html/review/:jobId` — Review conversion results

## Activation Rules

Imported templates:
- Are always saved as DRAFT
- Cannot be auto-activated
- Must pass compliance check before activation
- Must have license info when required
- Work with existing TemplateRenderer once activated
