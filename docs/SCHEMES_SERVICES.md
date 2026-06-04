# Schemes & Services Module

## Overview

The Schemes & Services module allows government CMS operators to publish, manage, and display public schemes (welfare programs) and citizen services. It supports categories, departments, eligibility criteria, benefits, required documents, fees, application links, and a complete workflow lifecycle.

## Data Model

### SchemeService
Single model for both schemes and services, differentiated by `type` field:
- `SCHEME` — Government welfare/benefit programs
- `SERVICE` — Citizen services (certificates, registrations, etc.)

### Status Lifecycle
```
DRAFT → UNDER_REVIEW → APPROVED → PUBLISHED → ARCHIVED/EXPIRED
```

### Key Fields
- title, slug, summary, description
- type (SCHEME/SERVICE)
- category, department
- targetAudience, eligibilityCriteria, benefits
- applicationProcess, requiredDocumentsJson, feesJson
- timeline, applicationMode, applicationUrl
- contactName, contactEmail, contactPhone
- publishAt, expiresAt, seoTitle, seoDescription

## Admin Routes

| Route | Purpose |
|-------|---------|
| /scheme-services | List all schemes & services |
| /scheme-services/new | Create new |
| /scheme-services/[id] | View/edit detail with workflow actions |
| /scheme-services/categories | Manage categories |
| /scheme-services/departments | Manage departments |

## Public Routes

| Route | Purpose |
|-------|---------|
| /schemes | List published schemes |
| /schemes/:slug | Scheme detail |
| /services | List published services |
| /services/:slug | Service detail |

## API Endpoints

### Admin (auth required)
- `GET /scheme-services` — List (paginated, filterable)
- `GET /scheme-services/:id` — Get by ID
- `POST /scheme-services` — Create
- `PUT /scheme-services/:id` — Update
- `DELETE /scheme-services/:id` — Soft delete
- `POST /scheme-services/:id/submit-review`
- `POST /scheme-services/:id/approve`
- `POST /scheme-services/:id/publish`
- `POST /scheme-services/:id/archive`
- `GET /scheme-services/summary`
- `GET /scheme-service-categories` / `POST` / `PUT` / `DELETE`
- `GET /departments` / `POST` / `PUT` / `DELETE`

### Public (no auth)
- `GET /public/schemes` — Published schemes (paginated)
- `GET /public/schemes/:slug` — Scheme detail
- `GET /public/services` — Published services (paginated)
- `GET /public/services/:slug` — Service detail
- `GET /public/scheme-service-categories`
- `GET /public/departments`

## Required Documents JSON Format
```json
[
  { "name": "Identity Proof", "description": "Aadhaar, Voter ID", "isMandatory": true },
  { "name": "Address Proof", "description": "Utility bill", "isMandatory": true }
]
```

## Fees JSON Format
```json
[
  { "label": "Application Fee", "amount": "100", "currency": "INR", "note": "Non-refundable" }
]
```

## Sidebar Location
Under **Government Modules** group:
- Schemes & Services → All, Categories, Departments

## Green Code Compliance
- All list APIs paginated with `take` limit
- Only `select` required fields in public queries
- Public detail loaded only on detail page (no eager loading in list)
- Draft/archived/expired items excluded from public queries
- No polling or duplicate API calls
- Module can be disabled via Module Management

## How to Create a Scheme
1. Navigate to /scheme-services/new
2. Select type = SCHEME
3. Fill title, slug, summary, description
4. Add eligibility, benefits, application process
5. Add required documents and fees (JSON)
6. Select category and department
7. Save → Submit for Review → Approve → Publish

## Troubleshooting
- **Scheme not showing publicly**: Check status is PUBLISHED, deletedAt is null
- **404 on public page**: Verify slug matches URL
- **Module hidden in sidebar**: Check Module Management → scheme_services is enabled
