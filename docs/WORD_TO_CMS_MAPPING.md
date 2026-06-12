# Word To CMS Mapping

Word import accepts `.docx` files and extracts content from the Open XML document package. The current pipeline parses document text, headings, paragraphs, tables, hyperlinks, and embedded media without external network calls.

## Extraction

- Source type: `WORD_DOCX`
- Upload limit: `MAX_CONTENT_IMPORT_FILE_SIZE_MB`
- Storage root: `CONTENT_IMPORT_UPLOAD_DIR`
- Extracted media folder: `uploads/content-imports/extracted/:jobId`
- Default item status: `REVIEW_REQUIRED`

The importer reads `word/document.xml`, relationship files, and `word/media/*`. Unsupported or malformed document parts are added to the job warning list instead of failing unrelated content.

## Field Mapping

- First heading or document filename -> item title.
- Normalized title -> item slug.
- First extracted text block -> item summary.
- Paragraph and table structure -> `bodyJson`.
- Embedded images -> `content_import_assets`.
- Hyperlinks -> structured extraction metadata.
- Default detected type -> `PAGE`.
- Default target module -> `pages` when that module is enabled.

## Review Boundary

Word imports create reviewable CMS candidates first. Editors must inspect the generated item, then approve or skip it. Approval starts draft import for supported `pages` mappings, creating a CMS page draft only. The importer must not auto-publish document content.

## Future AI Enhancement

AI cleanup, summarization, or module classification should be added behind the AI Router. Future prompts must log model usage, prefer free models, keep source text traceable, and require editor confirmation before draft creation.
