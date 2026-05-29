# Document Management

## Overview

The Document Management module allows CMS users to upload, manage, categorize, and publish documents (primarily PDFs) with AI-generated metadata for SEO, accessibility, and discoverability.

## Supported File Types

- PDF (primary, with text extraction)
- DOC, DOCX (Microsoft Word)
- XLS, XLSX (Microsoft Excel)
- PPT, PPTX (Microsoft PowerPoint)

## Upload Flow

1. User uploads file via `/documents/upload`
2. Backend validates MIME type, extension, file size
3. File saved to `uploads/documents/`
4. For PDFs: text extracted, page count determined
5. Document record created with DRAFT status
6. User redirected to metadata page

## AI Metadata Generation

1. User clicks "Generate Metadata" on document detail
2. Backend extracts text from PDF (up to 15,000 chars)
3. AI generates structured metadata JSON
4. User reviews AI suggestions
5. User applies selected metadata fields
6. Document status changes to READY_FOR_REVIEW

## Document Statuses

- DRAFT → initial upload
- PROCESSING → during AI generation
- READY_FOR_REVIEW → after AI metadata applied
- PUBLISHED → visible on public website
- ARCHIVED → hidden from public
- FAILED → extraction/processing error

## Permissions

- `documents.view` - View documents
- `documents.upload` - Upload new documents
- `documents.update` - Edit metadata
- `documents.delete` - Soft delete
- `documents.publish` - Publish for public access
- `documents.archive` - Archive documents
- `documents.generate_metadata` - Trigger AI generation
- `documents.apply_ai_metadata` - Apply AI results

## Environment Variables

```env
DOCUMENT_UPLOAD_DIR=uploads/documents
MAX_DOCUMENT_UPLOAD_SIZE_MB=25
PUBLIC_DOCUMENT_BASE_URL=http://localhost:3000/uploads/documents
DOCUMENT_TEXT_EXTRACTION_MAX_CHARS=15000
```

## Limitations

- No OCR for scanned/image-only PDFs in MVP
- Text extraction limited to selectable text
- AI metadata requires review before publishing
- No full-text search indexing in MVP
