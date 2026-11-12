# AWEN status site

Static status pages for [AWEN](https://github.com/marcpoliquin5/awen), an experimental compiler and runtime for photonic computing. Live at <https://marcpoliquin5.github.io/awenphotonics.github.io/>.

The site is four hand-written HTML pages and one stylesheet, with no framework and no runtime JavaScript. The fuller interactive site is [awen-labs](https://github.com/marcpoliquin5/awen-labs).

## Pages

| File | Page |
|---|---|
| `index.html` | Status: what the project is and what is available |
| `products.html` | Software: what the repository contains |
| `solutions.html` | Exploration: research directions |
| `research.html` | Evidence: what must exist before a performance claim is published |

## Build and check

Requires Node.js. The build and check scripts have no dependencies; `npm start` fetches `http-server` through `npx`.

```bash
npm run check:content   # lint the public copy
npm run build           # copy the pages and stylesheet to dist/
npm start               # serve dist/ at http://localhost:8080
```

`check:content` is a small script ([`scripts/check-content-claims.js`](scripts/check-content-claims.js)) that fails the build if a page:

- contains a number with a performance unit, a price, or comparative wording such as "faster" or "outperforms",
- is missing its status notice, or
- links to a local file that does not exist.

It runs on every pull request, so copy changes cannot merge with an unsupported claim or a broken link.

## Deployment

Pushing to `main` publishes the site with GitHub Pages (`.github/workflows/static.yml`).
