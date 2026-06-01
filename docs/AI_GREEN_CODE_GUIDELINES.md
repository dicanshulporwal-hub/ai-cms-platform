# AI Green Code Guidelines

## Purpose

Guidelines for AI-assisted code generation in this project. When using AI tools (Kiro, Copilot, ChatGPT, or the built-in AI Router), follow these rules to ensure generated code is efficient, safe, and maintainable.

## Rules for AI-Generated Code

### 1. Do Not Trust Blindly
- Always review AI-generated code before committing.
- AI may generate working but inefficient code.
- AI may not know the project's existing patterns.
- AI may introduce unnecessary dependencies.

### 2. Match Project Patterns
- AI-generated code must follow existing conventions:
  - TypeScript throughout
  - NestJS patterns for backend (modules, controllers, services)
  - Next.js App Router patterns for frontend
  - Prisma for database access
  - React Query for client-side data fetching
  - Tailwind CSS for styling
- Do not let AI introduce new frameworks or libraries without team discussion.

### 3. Efficiency Requirements
- AI-generated database queries must use `select` for specific fields.
- AI-generated list endpoints must include pagination.
- AI-generated frontend components must not fetch data unnecessarily.
- AI-generated AI calls must use the existing AI Router, not direct provider calls.

### 4. Security Requirements
- AI-generated code must sanitize user input.
- AI-generated endpoints must include auth guards.
- AI-generated HTML rendering must use sanitization.
- AI must not generate code that exposes secrets or internal data.

### 5. AI Provider Usage in the CMS

When the CMS uses its own AI Router for features:

| Principle | Rule |
|-----------|------|
| Model selection | Use AI Router's cost-aware selection, prefer free models |
| Token efficiency | Keep prompts concise, avoid repeating context |
| Caching | Cache identical AI requests where output is deterministic |
| Logging | Always log AI usage (provider, model, tokens, feature) |
| Fallback | Handle AI provider failures gracefully (show error, don't crash) |
| Rate limiting | Do not allow unlimited AI calls per user/session |
| Content safety | AI-generated content must be saved as DRAFT, never auto-published |

### 6. When to Use AI vs Simple Logic

| Task | Use AI? | Better Alternative |
|------|---------|-------------------|
| Generate alt text for images | Yes | — |
| Generate meta descriptions | Yes | — |
| Validate email format | No | Regex |
| Check if string is empty | No | `.trim().length` |
| Detect HTML regions | No | DOM parsing / regex |
| Generate template from screenshot | Yes | — |
| Sanitize HTML | No | Existing sanitizer |
| Translate content | Yes (via Bhashini/provider) | — |
| Calculate accessibility score | No | Rule-based checker |
| Suggest broken link fixes | Yes | — |
| Format dates | No | `toLocaleDateString` |

### 7. AI Code Generation Prompts

When asking AI to generate code for this project, include:
- The target file location
- The existing pattern to follow (reference a similar file)
- The specific functionality needed
- Constraints (no new dependencies, must use existing services)
- Expected input/output types

### 8. AI-Generated Documentation

- AI can generate documentation, but verify technical accuracy.
- AI-generated docs should be marked if they haven't been manually verified.
- Do not let AI generate fake examples with incorrect API responses.

## Anti-Patterns in AI-Generated Code

| Anti-Pattern | Why It's Bad | Fix |
|---|---|---|
| `findMany()` without `take` | Unbounded queries | Add `take: 50` or pagination |
| Inline styles in React | Hard to maintain | Use Tailwind classes |
| `any` type everywhere | Loses type safety | Define proper interfaces |
| New `fetch` wrapper | Duplicates existing `apiClient` | Use `apiClient` |
| Direct Prisma in controller | Breaks service layer | Move to service |
| Console.log for debugging | Noise in production | Use proper logger or remove |
| Hardcoded URLs | Breaks across environments | Use env variables |

## Monitoring AI Efficiency

Track monthly:
- Total AI API calls
- Total tokens consumed
- Cost per feature (content generation, translation, schema, etc.)
- Cache hit rate for AI responses
- Failed AI calls and fallback usage
