# Template Manager

## Architecture

The Template Manager allows Admin/Super Admin users to upload, generate, preview, and activate frontend website templates for the public website.

## Upload Flow

1. Admin uploads a ZIP package via `/templates/upload`
2. Backend validates ZIP structure, checks for dangerous files
3. Extracts `template.json` and validates required fields
4. Saves files to `uploads/templates/{slug}/`
5. Runs automated UX4G/GIGW compliance checks
6. Creates template record with DRAFT status
7. Admin reviews compliance report and activates when ready

## AI Generation Flow

1. Admin navigates to `/templates/ai-generate`
2. Selects template type and provides prompt
3. AI generates semantic HTML, CSS, and template.json
4. Result is previewed in the admin panel
5. Admin saves as draft template
6. Compliance checks run automatically
7. Admin reviews and activates manually

## Compliance Engine

Automated checks across categories:
- Government Identity (header, branding, footer)
- Accessibility (skip-to-content, semantic HTML, lang, headings)
- Usability (navigation, breadcrumbs)
- Mobile Responsiveness (viewport, responsive CSS)
- Footer & Policy Links (contact, policies, help, sitemap)
- Security (unsafe scripts, SVG)

Score: 0-100 based on pass/fail ratio.

## UX4G/GIGW Readiness Disclaimer

This system provides automated readiness checks only. Final compliance/certification must be performed separately through official assessment processes.

## Security Protections

- ZIP path traversal prevention
- Dangerous file extension blocking (.exe, .bat, .php, etc.)
- Custom JS disabled by default (TEMPLATE_ALLOW_CUSTOM_JS=false)
- SVG sanitization
- No auto-activation of AI-generated templates
- No arbitrary code execution
- JWT auth required for all endpoints

## Environment Variables

```env
TEMPLATE_UPLOAD_DIR=uploads/templates
MAX_TEMPLATE_UPLOAD_SIZE_MB=25
PUBLIC_TEMPLATE_BASE_URL=http://localhost:3000/uploads/templates
TEMPLATE_ALLOW_CUSTOM_JS=false
AI_TEMPLATE_GENERATION_ENABLED=true
```

## API Endpoints

```
GET    /templates                              List templates
GET    /templates/:id                          Get template
POST   /templates/upload                       Upload ZIP
PUT    /templates/:id                          Update metadata
DELETE /templates/:id                          Soft delete
POST   /templates/:id/activate                 Activate
POST   /templates/:id/deactivate              Deactivate
POST   /templates/:id/run-compliance-check    Run checks
GET    /templates/:id/compliance-report       Get report
GET    /templates/active/current              Get active template
POST   /templates/ai/generate-from-screenshot AI generate
GET    /templates/ai/generation-jobs/:id      Job status
POST   /templates/ai/generation-jobs/:id/save-as-template  Save as draft
```
