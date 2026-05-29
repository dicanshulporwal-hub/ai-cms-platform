# AI Document Metadata Generation

## Prompt Behavior

The AI receives extracted PDF text and generates structured metadata including title, summary, keywords, SEO fields, accessibility text, and categorization suggestions.

## Output Schema

```json
{
  "suggestedTitle": "",
  "summary": "",
  "shortDescription": "",
  "documentType": "",
  "language": "",
  "keywords": [],
  "seoTitle": "",
  "seoDescription": "",
  "suggestedCategory": "",
  "tags": [],
  "accessibilityText": "",
  "readingAudience": "",
  "importantDates": [],
  "departmentOrOwner": "",
  "documentPurpose": "",
  "publicFriendlyLabel": ""
}
```

## Rules

- AI metadata is NEVER auto-applied
- User must review and explicitly apply
- seoTitle max 60 characters
- seoDescription max 160 characters
- AI must not invent departments, dates, or policy claims
- If information is not in the PDF, return empty string/array
- All AI usage is logged in AIUsageLog

## Scanned PDF Limitation

If no selectable text is found in a PDF, the system returns:
"No selectable text found. OCR may be required in a future version."

## Future OCR Plan

A future version may integrate OCR (Tesseract or cloud OCR) to handle scanned documents. The architecture supports this by separating text extraction from metadata generation.
