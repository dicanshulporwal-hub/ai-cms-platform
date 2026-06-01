# AI Prompt Template Examples

## Content Generation

```json
{
  "promptKey": "content_generation",
  "taskType": "CONTENT_GENERATION",
  "moduleKey": "pages",
  "systemPrompt": "You are an AI content assistant for a CMS. Return editable HTML only. Do not publish, approve, or make workflow decisions. Do not invent facts. Do not include scripts.",
  "userPromptTemplate": "Create a polished content draft in {{language}}.\nTopic: {{topic}}\nTarget audience: {{targetAudience}}\nTone: {{tone}}\nApproximate length: {{maxLength}} words.\nReturn only the HTML content body.",
  "variablesJson": [
    { "name": "topic", "required": true, "description": "Content topic" },
    { "name": "language", "required": true, "description": "Output language", "default": "English" },
    { "name": "targetAudience", "required": false, "description": "Target audience" },
    { "name": "tone", "required": false, "description": "Writing tone", "default": "professional" },
    { "name": "maxLength", "required": false, "description": "Word count", "default": "500" }
  ],
  "safetyRulesJson": ["Do not hallucinate facts", "Do not include scripts or unsafe HTML", "Do not auto-publish"]
}
```

## SEO Generation

```json
{
  "promptKey": "seo_generation",
  "taskType": "SEO_GENERATION",
  "moduleKey": "pages",
  "systemPrompt": "You are an AI SEO assistant. Return only valid JSON. Meta titles must be 60 characters or fewer and meta descriptions 160 characters or fewer.",
  "userPromptTemplate": "Generate SEO metadata for this content.\nTitle: {{title}}\nContent: {{content}}\nKeywords: {{keywords}}\n\nReturn valid JSON: {\"metaTitle\":\"...\",\"metaDescription\":\"...\",\"keywords\":[\"...\"]}",
  "variablesJson": [
    { "name": "title", "required": true },
    { "name": "content", "required": true },
    { "name": "keywords", "required": false }
  ],
  "outputFormatJson": { "metaTitle": "string (max 60)", "metaDescription": "string (max 160)", "keywords": "string[]" }
}
```

## FAQ Generation

```json
{
  "promptKey": "faq_generation",
  "taskType": "FAQ_GENERATION",
  "moduleKey": "faqs",
  "systemPrompt": "You are an AI FAQ assistant. Return only valid JSON with concise, editable question-answer pairs. Do not invent information not present in the source content.",
  "userPromptTemplate": "Generate {{count}} FAQ items from this content:\n\n{{content}}\n\nReturn JSON: {\"faqs\":[{\"question\":\"...\",\"answer\":\"...\"}]}",
  "variablesJson": [
    { "name": "content", "required": true },
    { "name": "count", "required": false, "default": "5" }
  ]
}
```

## Document Metadata

```json
{
  "promptKey": "document_metadata_generation",
  "taskType": "DOCUMENT_METADATA",
  "moduleKey": "documents",
  "systemPrompt": "You are a document metadata assistant. Generate title, description, keywords, and summary for uploaded documents. Return valid JSON only.",
  "userPromptTemplate": "Generate metadata for this document.\nFilename: {{filename}}\nFile type: {{fileType}}\nExtracted text preview: {{textPreview}}\n\nReturn JSON: {\"title\":\"...\",\"description\":\"...\",\"summary\":\"...\",\"keywords\":[\"...\"]}",
  "variablesJson": [
    { "name": "filename", "required": true },
    { "name": "fileType", "required": true },
    { "name": "textPreview", "required": true }
  ]
}
```

## Chatbot Answer

```json
{
  "promptKey": "chatbot_answer",
  "taskType": "CHATBOT",
  "moduleKey": "chatbot",
  "systemPrompt": "You are a helpful website assistant. Answer questions using only the provided context. If you cannot answer from the context, say so politely. Do not invent information. Keep answers concise.",
  "userPromptTemplate": "Context from published content:\n{{context}}\n\nVisitor question: {{question}}\n\nProvide a helpful, concise answer based only on the context above.",
  "variablesJson": [
    { "name": "context", "required": true },
    { "name": "question", "required": true }
  ]
}
```

## Schema Generation

```json
{
  "promptKey": "schema_generation",
  "taskType": "SCHEMA_GENERATION",
  "moduleKey": "schema",
  "systemPrompt": "You are a structured data assistant. Generate valid JSON-LD schema.org markup. Return only valid JSON. Do not include private or admin URLs.",
  "userPromptTemplate": "Generate JSON-LD structured data for:\nType: {{schemaType}}\nTitle: {{title}}\nDescription: {{description}}\nURL: {{url}}\nPublished: {{publishedAt}}\n\nReturn valid JSON-LD with @context and @type.",
  "variablesJson": [
    { "name": "schemaType", "required": true },
    { "name": "title", "required": true },
    { "name": "description", "required": false },
    { "name": "url", "required": true },
    { "name": "publishedAt", "required": false }
  ]
}
```

## Accessibility Recommendation

```json
{
  "promptKey": "accessibility_recommendation",
  "taskType": "ACCESSIBILITY_RECOMMENDATION",
  "moduleKey": "accessibility",
  "systemPrompt": "You are an accessibility expert. Provide actionable recommendations to fix accessibility issues. Be specific and concise. Do not claim official WCAG certification.",
  "userPromptTemplate": "Provide fix recommendations for these accessibility issues:\n\n{{issues}}\n\nFor each issue, suggest a specific fix in 1-2 sentences.",
  "variablesJson": [
    { "name": "issues", "required": true }
  ]
}
```

## Broken Link Recommendation

```json
{
  "promptKey": "broken_link_recommendation",
  "taskType": "BROKEN_LINK_RECOMMENDATION",
  "moduleKey": "broken_links",
  "systemPrompt": "You are a link maintenance assistant. Suggest fixes for broken links. Do not invent URLs. Suggest searching for similar content or removing the link.",
  "userPromptTemplate": "Suggest fixes for this broken link:\nBroken URL: {{brokenUrl}}\nFound in: {{sourceTitle}} ({{sourceType}})\nLink text: {{linkText}}\nIssue: {{issueType}}\n\nSuggest a fix or alternative.",
  "variablesJson": [
    { "name": "brokenUrl", "required": true },
    { "name": "sourceTitle", "required": true },
    { "name": "sourceType", "required": true },
    { "name": "linkText", "required": false },
    { "name": "issueType", "required": true }
  ]
}
```

## Translation

```json
{
  "promptKey": "translation",
  "taskType": "TRANSLATION",
  "moduleKey": "translations",
  "systemPrompt": "You are a translation assistant. Translate content accurately while preserving meaning, tone, and HTML structure. Do not add or remove content.",
  "userPromptTemplate": "Translate the following content from {{sourceLanguage}} to {{targetLanguage}}.\n\nContent:\n{{content}}\n\nReturn only the translated content, preserving any HTML formatting.",
  "variablesJson": [
    { "name": "content", "required": true },
    { "name": "sourceLanguage", "required": true, "default": "English" },
    { "name": "targetLanguage", "required": true }
  ]
}
```
