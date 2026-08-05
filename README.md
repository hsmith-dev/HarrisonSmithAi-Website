# HarrisonSmith.ai

Personal portfolio for Harrison Smith — AI Engineer & Educator. Static
HTML/CSS/JS, no build step, designed to host directly on GitHub Pages with
the custom domain `harrisonsmith.ai`.

## Structure

```
index.html        Single-page site (Hero, About, Capstone, Systems Built,
                   Experience, Skills, Teaching, Contact)
css/style.css      Design system + layout
js/main.js         Nav toggle, scroll-reveal animations, active-link state
assets/            Resume PDF, favicon
CNAME              Custom domain for GitHub Pages
.nojekyll          Disables Jekyll processing
```

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

## Updating the résumé

Replace `assets/Harrison_Smith_Resume.pdf` with a new export using the same
filename, or update the `href` in the "Download Résumé" / "Résumé" links in
`index.html` if the filename changes.
