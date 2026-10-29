# HarrisonSmith.ai

Site for Harrison Smith's contract AI and data engineering practice,
operating as HSmithDev LLC. Static HTML/CSS/JS, no build step, designed to
host directly on GitHub Pages with the custom domain `harrisonsmith.ai`.

## Structure

```
index.html          Single-page site (Hero, Platform teaser, About, Services,
                     Process, Work, Experience, Contact)
platform.html        Reporting Platform: Deckhand flagship demo + 14 other
                     case-study apps, all client-side with fictional data
css/style.css        Design system + layout
css/platform.css      Platform page styling + chart/widget components
js/main.js            Menu, GSAP scroll choreography (loaded from cdnjs; the
                     page stays fully readable without it)
js/mock-data.js        Seeded random generators for every case study's
                     fictional data (no real company, product, or table
                     names anywhere in this repo)
js/charts.js            Small reusable SVG chart primitives (sparkline, bar,
                     donut, funnel, heatmap, node graph)
js/platform-apps.js      Copy + render() for the 14 non-Deckhand case studies
js/platform.js            Renders the case-study grid, wires expand/collapse
js/deckhand-demo.js        The Deckhand slide canvas, refresh simulation,
                     and scripted walkthrough
js/hero-preview.js          Fills the homepage hero's live-looking mini
                     dashboard
assets/              Favicon, og-image.png, work/ screenshots
404.html             Branded not-found page (served by GitHub Pages)
CNAME                Custom domain for GitHub Pages
.nojekyll            Disables Jekyll processing
```

The reporting platform section is a sanitized demo: every company, product,
table, and number on `platform.html` (and in the homepage's Platform teaser)
is invented. It illustrates the kind of internal BI tooling built day to day
with Claude Code, Grok, and Codex — not any employer's actual product.

## Deploying to GitHub Pages

1. Push this repo to GitHub (e.g. `harrisonsmithai/harrisonsmith.ai` or any
   repo name — the `CNAME` file controls the custom domain regardless).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`,
   branch `main`, folder `/ (root)`.
4. Under **Custom domain**, confirm `harrisonsmith.ai` (it will read from the
   committed `CNAME` file automatically) and enable **Enforce HTTPS** once
   the certificate provisions.
5. At your domain registrar, point DNS at GitHub Pages:
   - `A` records for the apex (`harrisonsmith.ai`) → GitHub Pages IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www` → `<your-github-username>.github.io`

DNS propagation can take up to a few hours. GitHub will show a green check
under Settings → Pages once the domain and HTTPS cert are verified.

## Editing content

Everything is hand-written HTML/CSS/JS — no framework, no build tooling.
Edit `index.html` for copy/content, `css/style.css` for design tokens
(colors, spacing, radii are CSS custom properties at the top of the file),
and `js/main.js` for behavior.
