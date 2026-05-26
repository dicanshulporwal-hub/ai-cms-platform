# Template Package Example

## ZIP Structure

```
my-template.zip
├── template.json
├── index.html
├── styles.css
├── preview.png
├── assets/
│   ├── logo-placeholder.png
│   └── hero-bg.jpg
└── fonts/
    ├── inter.woff2
    └── inter.woff
```

## Sample template.json

```json
{
  "name": "Government Portal",
  "slug": "government-portal",
  "version": "1.0.0",
  "type": "GOVERNMENT",
  "description": "A GIGW-ready government department website template.",
  "entry": "index.html",
  "thumbnail": "preview.png",
  "supports": {
    "pages": true,
    "blogs": true,
    "navigation": true,
    "chatbot": true,
    "accessibilityControls": true
  },
  "regions": [
    "header",
    "navigation",
    "breadcrumb",
    "main",
    "sidebar",
    "footer"
  ],
  "complianceHints": {
    "gigwReady": true,
    "ux4gAligned": true
  }
}
```

## Accessibility Recommendations

- Include `<a href="#main-content" class="skip-link">Skip to main content</a>` as first element
- Use `<html lang="en">` 
- Use semantic elements: `<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`
- Proper heading hierarchy (H1 → H2 → H3)
- Include `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Footer should include: Contact Us, Website Policies, Help, Feedback, Sitemap, Accessibility Statement
- All images should have alt text placeholders
- Use sufficient color contrast (4.5:1 minimum)
- Ensure keyboard navigability for all interactive elements
