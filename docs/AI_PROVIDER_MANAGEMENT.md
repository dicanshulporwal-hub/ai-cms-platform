# AI Provider Management

## Architecture

The AI system uses a central AI Router that selects the best provider/model based on task type, cost preference, and availability.

## Current Providers
- **OpenAI** — GPT models, paid API
- **Google Gemini** — Free-tier available via Google AI Studio

## Future Providers (Optional)
- Cohere, Anthropic, Mistral, Groq, Azure OpenAI, Local LLM

## Selection Modes
- **AUTO** — System selects based on routing rules and cost preference
- **MANUAL** — User explicitly chooses provider/model

## Cost Preferences
- `PREFER_FREE` — Try free/free-tier models first
- `PREFER_LOWEST_COST` — Minimize cost
- `PREFER_BEST_QUALITY` — Use best available model
- `PREFER_LOWEST_LATENCY` — Fastest response
- `MANUAL_ONLY` — No auto-selection

## Pricing Types
- `FREE` — No cost (e.g., local LLM)
- `FREE_TIER` — Free within limits (e.g., Gemini via AI Studio)
- `PAID` — Requires payment (e.g., OpenAI)
- `CUSTOM` — Custom pricing
- `UNKNOWN` — Not yet determined

## API Key Security
- Keys encrypted with AES-256-CBC before storage
- Never returned to frontend (shown as ••••••••)
- Requires `AI_SECRET_ENCRYPTION_KEY` env variable

## API Endpoints
```
GET/POST /ai-providers
GET/PUT/DELETE /ai-providers/:id
PATCH /ai-providers/:id/status
POST /ai-providers/:id/test-connection
GET/POST /ai-providers/:id/models
PUT/PATCH /ai-providers/:id/models/:modelId
```

## Environment Fallback
If no database providers are configured, the system falls back to:
- `AI_PROVIDER` env var (openai/gemini)
- `GEMINI_API_KEY` / `OPENAI_API_KEY`
