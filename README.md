# AWEN public research site

This repository builds the static status site for AWEN photonics research
software. Public copy is deliberately limited to repository-verifiable
implementation and availability statements.

## Build and validate

Install a supported Node.js release, then run:

```bash
npm run check:content
npm run build
```

The build emits only the public HTML pages and stylesheet to `dist/`. The content
check rejects unsupported numerical/comparative sales patterns, requires a status
disclosure on every page, and rejects broken local links. Pull requests also use
the content-review checklist for claims that require human source evaluation.

See `CONTENT_AUDIT.md` for the complete disposition of the site's former product,
benchmark, customer, pricing, roadmap, and research assertions.
