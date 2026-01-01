# Awen Photonics — static site build

This repository is a plain static site (HTML + CSS). The repository contains a small build helper to produce a production-ready `dist/` folder.

Commands

Install Node (>=14) and run:

```bash
node --version
npm run build      # create dist/
npm run start      # serve dist/ on http://localhost:8080 (uses npx http-server)
```

Notes

- The `build` script copies project files into `dist/` and performs minimal HTML/CSS whitespace minification.
- You can publish `dist/` to GitHub Pages or any static host.
