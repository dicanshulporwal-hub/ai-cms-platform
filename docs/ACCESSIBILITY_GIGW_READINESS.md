# Accessibility & GIGW Readiness Module

## Overview

Automated readiness checks for accessibility, UX4G/GIGW compliance, SEO, and template safety. This module helps admins identify issues and get recommendations — it does **not** constitute official GIGW certification.

## Check Categories

### Accessibility (13 checks)
- Skip-to-content link
- Semantic landmarks (header, nav, main, footer)
- Single H1 heading
- Logical heading order
- Images have alt text
- Language attribute on HTML
- Responsive viewport meta
- No empty headings/links
- Form inputs have labels

### UX4G/GIGW Readiness (7 checks)
- Contact link exists
- Feedback link exists
- Help link exists
- Sitemap link exists
- Privacy Policy & Terms links
- Accessibility statement
- Footer ownership/copyright

### SEO (2 checks)
- Meta title exists
- Meta description exists

### Template Safety (2 checks)
- No inline scripts
- No inline event handlers

### Content (per page, 5 checks)
- Page has title
- Page has content
- Meta title exists
- Meta description exists
- Content images have alt text

## Scoring Logic

Weighted scoring based on severity:
- CRITICAL: weight 4
- HIGH: weight 3
- MEDIUM: weight 2
- LOW: weight 1

Score = (earned weight / total weight) × 100

PASS = full weight, WARNING = 50% weight, FAIL = 0 weight.

## Audit Types

- **Full Site**: Checks active template + all published pages
- **Template**: Checks a specific template's HTML
- **Page**: Checks a specific page's content and metadata

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /accessibility/summary | Dashboard summary stats |
| GET | /accessibility/audits | List recent audits |
| GET | /accessibility/audits/:id | Audit detail with issues |
| POST | /accessibility/audits/run-full-site | Run full site audit |
| POST | /accessibility/audits/run-template/:id | Audit specific template |
| POST | /accessibility/audits/run-page/:id | Audit specific page |
| GET | /accessibility/issues | List issues with filters |

## Admin Routes

- `/accessibility` — Dashboard with score, stats, recent audits
- `/accessibility/audits/:id` — Audit detail with categorized issues

## Permissions

- Super Admin / Admin: Run audits, view all
- Editor: View issues (read-only)

## Limitations

- Does not perform real browser rendering or contrast analysis
- Does not test keyboard navigation interactively
- Does not validate ARIA patterns in depth
- Does not constitute official GIGW certification
- Checks are based on HTML pattern matching, not DOM inspection
- Full WCAG compliance requires manual testing with assistive technologies
