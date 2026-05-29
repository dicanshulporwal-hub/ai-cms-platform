# AI Cost and Free Models

## Pricing Types

| Type | Description |
|------|-------------|
| FREE | No API charges (local LLM, self-hosted) |
| FREE_TIER | Free within provider limits (Gemini AI Studio) |
| PAID | Requires payment per token/request (OpenAI) |
| CUSTOM | Custom pricing arrangement |
| UNKNOWN | Pricing not yet determined |

## Why Pricing Must Be Editable

Provider pricing changes frequently. What's free today may become paid tomorrow. The system allows admins to update pricing type at any time.

## Free-First Routing

When `costPreference = PREFER_FREE`:
1. System checks for enabled models with `isFree: true`
2. Then checks for `isFreeTier: true`
3. If `allowPaidModels: false`, stops here
4. If `allowPaidModels: true`, uses paid model as last resort

## Paid Model Safety

- `allowPaidModels` setting controls whether paid models can be used
- `requireFreeModel` forces free-only selection
- Frontend shows warning before using paid models
- Admin can disable paid models system-wide

## Current Default Configuration

- **Gemini**: FREE_TIER (Google AI Studio free tier)
- **OpenAI**: PAID (standard API pricing)
- **Local LLM**: FREE (no API charges)
- **Cohere**: UNKNOWN (optional, not configured by default)
