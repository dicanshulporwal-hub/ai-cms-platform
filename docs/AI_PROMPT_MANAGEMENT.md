# AI Prompt Management & Governance

## Overview

Centralized management of AI prompts used across the CMS. Supports versioning, approval workflow, variable substitution, safety rules, and governance dashboards.

## Prompt Lifecycle

```
DRAFT → PENDING_APPROVAL → APPROVED → ACTIVE → ARCHIVED
                                ↑                    |
                                └── ROLLBACK ────────┘
```

- Only approved versions can be activated
- Only one active version per prompt template
- Rollback activates a previous approved version
- System prompts cannot be deleted

## Data Model

- **AiPromptTemplate** — The prompt definition (key, name, task type, module)
- **AiPromptVersion** — Versioned content (system prompt, user template, variables, safety rules)
- **AiPromptTestRun** — Test execution results (input, output, tokens, latency)

## Prompt Variables

Templates use `{{variable}}` placeholders:

```
{{topic}} — Content topic
{{content}} — Source content
{{language}} — Target language
{{tone}} — Writing tone
{{maxLength}} — Output length limit
{{outputFormat}} — Expected output structure
```

## Rendering Engine

`AiPromptRenderingService`:
1. Loads active version by `promptKey` (cached 60s in memory)
2. Replaces `{{variables}}` with provided values
3. Validates required variables are present
4. Returns rendered system + user prompts

## Green Code Decisions

- Active prompts cached in memory (Map with 60s TTL) — avoids DB query per AI call
- List queries paginated with `take: 50`
- `select` used for list views (only needed fields)
- No heavy editor dependency — uses `<textarea>` with monospace
- Backward compatible: existing AI features keep working if no prompt template exists

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /ai-prompts | List prompt templates |
| GET | /ai-prompts/:id | Get prompt with versions |
| POST | /ai-prompts | Create prompt template |
| DELETE | /ai-prompts/:id | Soft delete |
| POST | /ai-prompts/:id/versions | Create new version |
| POST | /ai-prompts/:id/versions/:vid/activate | Activate version |
| POST | /ai-prompts/:id/versions/:vid/rollback | Rollback to version |
| GET | /ai-prompts/runtime/:promptKey | Get active rendered prompt |
| POST | /ai-prompts/render | Render prompt with variables |
| GET | /ai-prompts/governance/summary | Governance stats |

## Admin Routes

- `/ai/prompts` — List with governance summary
- `/ai/prompts/:id` — Detail with version history, activate/rollback

## Safety Rules

Each prompt version can define safety rules:
- No hallucination instruction
- Cite source content
- Do not invent government claims
- Do not expose internal data
- Return strict JSON where required
- Review-before-publish rule

## Integration with AI Router

Existing AI features can call:
```typescript
const rendered = await promptRendering.renderPrompt('content_generation', { topic, language });
if (rendered) {
  // Use rendered.systemPrompt and rendered.userPrompt
} else {
  // Fall back to hardcoded prompt
}
```

## Permissions

- Super Admin: Full access
- Admin: Create, edit, activate (with permission)
- Editor: View/test only (with permission)
