# SEO Audit Fixes — nanomarketcap.com

Status: code fixes applied and verified on 20 Oct 2026.

Verification:
- `pnpm typecheck` passes.
- `pnpm build` passes with `NEXT_PUBLIC_SITE_URL=https://nanomarketcap.com`.
- Biome passes on all 48 changed files.
- Repo-wide `pnpm check` still reports 77 pre-existing errors in untouched files (CRLF formatting).

## Root causes fixed

### 1. Host canonicalization

- `src/env.ts` normalizes `https://nanomarketcap.com` to `https://www.nanomarketcap.com`, so every consumer (`metadataBase`, canonical, hreflang, sitemap, RSS, JSON-LD, OG URLs) uses the served host even if the deploy env still says apex.
- `next.config.mjs` permanently redirects apex `nanomarketcap.com` and both `xnomarketcap.com` hosts to `www.nanomarketcap.com`.
- `/coin/xno` permanently redirects to `/coin/nano`, including locale-prefixed paths.

Verified in a production-like build: canonical, sitemap `<loc>`, `robots.txt` sitemap, and `og:url` all use `https://www.nanomarketcap.com`.

### 2. Server-rendered core content

- Added `src/components/market-summary.tsx`: server-rendered H1, live price, 24h change, market cap, rank, and 300+ characters of evergreen copy on the homepage.
- Added `src/components/coin-summary.tsx`: server-rendered H1, description, price, market cap, volume, and rank on every coin page.
- Homepage and coin pages now contain real prices and headings in raw HTML; no JavaScript required.

### 3. Metadata and structured data

- Article titles are absolute, removing triple-branded titles.
- Coin and news titles are absolute, keeping one brand suffix.
- Article cover title is no longer a second H1; each article has exactly one H1.
- `NewsArticle` image URL bug fixed; `/api/og` now returns PNG at 1200x630.
- Article schema is an `@graph` with locale-aware `mainEntityOfPage`, `dateModified`, `author`, publisher `@id`, `isPartOf`, and `BreadcrumbList`.
- Coin pages emit `WebPage`, `FinancialProduct`, and `BreadcrumbList`.
- News hub emits `CollectionPage` and `ItemList`.
- Organization now has `alternateName`, description, PNG logo, and GitHub `sameAs`.
- Trust pages (`/about`, `/contact`, `/authors`, `/editorial-policy`) were added with `WebPage` and breadcrumb schema.

### 4. Sitemap, robots, and discovery

- Sitemap rebuilt from a route list: 48 canonical URLs, including 3 coin pages, 5 tool pages, 4 trust pages, news, and partners.
- Removed request-time `lastmod`; news uses `updated ?? date`, static routes omit `lastmod`.
- Added `x-default` to every sitemap alternate set.
- Added explicit AI crawler groups to `robots.txt`.
- Added `/llms.txt` and `/api/openapi.json`.
- Added CORS and `Vary: Origin` to `/api/*`; read-only GETs no longer require an `Origin` header.
- Added `scripts/indexnow.mjs` and `pnpm indexnow`.

### 5. Crawl and URL hygiene

- Proxy redirects case variants to lowercase with 308.
- Proxy redirects invalid or out-of-range news pagination to `/news` with 308.
- Locale redirects now send `Vary: Accept-Language` and `Cache-Control: private, no-store`.
- Locale cookie now has `Secure` and a one-year `Max-Age`.
- Crawler throttle raised from 1 to 30 requests per minute per agent.
- News image assets now use immutable one-year caching.

### 6. Performance

- Disabled `experimental.inlineCss`; homepage HTML dropped from ~599 KB to ~248 KB.
- Added `optimizePackageImports` for `recharts` and `lucide-react`.
- Article HTML dropped from ~599 KB to ~168 KB.
- OG route no longer fetches an external font for a non-Latin glyph.

### 7. Visual, accessibility, and localization

- Mobile header controls and locale switcher are 44x44.
- Announcement body is hidden on mobile; CTA uses a higher-contrast token.
- Light-mode trend green darkened to `#0a7d52`; down red to `#c62828`.
- Ticker duplicate is `inert`; currency select has an accessible label.
- Market table headers use `scope` and `aria-sort`.
- Currency formatting no longer inherits the server/browser locale; `market-overview.tsx` passes the active locale.
- Home copy adds the Nano vs Nano Labs / Nano One Materials disambiguation.
- Article pages show a "not investment advice" disclaimer.

## Remaining deploy tasks

1. Set `NEXT_PUBLIC_SITE_URL=https://www.nanomarketcap.com` in Vercel. The code normalizes apex to www, but matching the env removes ambiguity.
2. Confirm the Vercel primary domain is `www.nanomarketcap.com` and apex is permanent.
3. Add `INDEXNOW_KEY` and `public/<key>.txt`, then run `pnpm indexnow` after a deploy.
4. Tune Vercel Firewall / rate limits for AI crawler bursts; the proxy now allows 30/min, but edge limits can still return 429.
5. Submit the new sitemap in Search Console and validate one article and one coin page in the Rich Results Test.
6. Watch GSC "Page with redirect" and "Soft 404" for 4 weeks.

## Remaining content tasks

- Trust pages are English-only; translations are pending.
- The 5 unpublished drafts are 200-305 words. Do not publish them as-is.
- Three articles still need primary-source links: `how-nano-consensus-works`, `welcome-to-nanomarketcap-news`, `xno-one-billion-market-cap`.
- News cadence is still the constraint on the "nano crypto news" query; target 2 posts per week.
- Real-device check of the mobile double-paint artifact seen in Playwright emulation.

## Known limitations

- `hreflang` links are still rendered in the body by `HreflangLinks` because `metadata.alternates.languages` is not emitted with Cache Components. The response `Link` header and sitemap `x-default` are valid alternates.
- Unknown coin IDs return a noindex 404 page with HTTP 200 under PPR; `/coin/xno` is handled by a permanent redirect.
- `GoogleOther` remains disallowed in `robots.txt` by existing intent.
- WebMCP, `ai-catalog.json`, and Markdown content negotiation were not added; they are optional until there is an agent-facing product surface.
