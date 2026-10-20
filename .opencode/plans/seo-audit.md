# SEO Audit — nanomarketcap.com

**Target:** https://www.nanomarketcap.com (production; the repo's dev server was not running)
**Audited:** 20 Oct 2026
**Business type:** Crypto data publisher — multi-asset market dashboard + Nano (XNO) news in 6 locales
**Scope:** 9 parallel sub-audits (technical, content, schema, sitemap, performance, visual, GEO, agentic, SXO) plus direct verification of the highest-impact findings

---

## SEO Health Score: 49 / 100

| Category | Weight | Score | Weighted | Verdict |
|---|---:|---:|---:|---|
| Technical SEO | 22% | 62 | 13.6 | Sound infrastructure, contradictory host signals |
| Content Quality | 23% | 52 | 12.0 | Strong editorial voice, money pages have zero crawlable content |
| On-Page SEO | 20% | 40 | 8.0 | No H1 on core pages, duplicate H1s, tripled brand titles |
| Schema / Structured Data | 10% | 34 | 3.4 | Valid but incomplete; malformed article image on every post |
| Performance (CWV) | 10% | 51 | 5.1 | Mobile lab 51; 3 s TBT, 3.4 s React bootup |
| AI Search Readiness | 10% | 52 | 5.2 | Articles are citable; the data itself is invisible to crawlers |
| Images | 5% | 35 | 1.8 | No content images on core pages; SVG OG images |
| **Total** | **100%** | | **49.1** | **Needs work** |

SXO (intent fit) scored separately at **35/100** — a page-type mismatch, not an SEO health category.

**One sentence:** the engineering and editorial craft are good, but the site's two revenue page types ship as empty client-rendered shells and every canonical, hreflang and sitemap URL points at a redirect.

---

## The three root causes

Almost every finding below is a symptom of one of these:

1. **The served host and the declared host disagree.**
   `https://www.nanomarketcap.com/` returns 200 and declares `canonical = https://nanomarketcap.com`. The apex host returns **307 → www**. So the canonical target redirects back to the page, the sitemap lists 32 URLs that all redirect, and the HTML hreflang set (apex) conflicts with the response-header hreflang set (www). One env value controls all of it.

2. **The primary page types are client-only.**
   Raw `/` HTML: 343 words, no `<h1>`, no price or market-cap figure, 389 skeleton markers. Rendered: prices appear, still **0 `<h1>`**. `/coin/nano`: 0 JSON-LD, no `<h1>` in served HTML, main text is "XNO XNO". This single defect drives the content, GEO, agentic, SXO and LCP findings — they are the same problem seen from five angles.

3. **The metadata templates append and concatenate instead of composing.**
   `| NanoMarketCap` is appended to titles that already contain it (22/32, max 109 chars), the article hero renders a second `<h1>`, and the article schema image is `https://nanomarketcap.comhttps://nanomarketcap.com/api/og?...`. These are template bugs, not content problems.

---

## Critical

| # | Finding | Evidence | Fix |
|---|---|---|---|
| **C1** | Canonical host is a redirecting host | `www/` 200 with `canonical=https://nanomarketcap.com`; apex → **307** → www; all 32 sitemap `<loc>` apex; `robots.txt` declares apex sitemap; HTML hreflang apex vs `Link` header hreflang www | Set `NEXT_PUBLIC_SITE_URL=https://www.nanomarketcap.com` in production (source for `metadataBase`, canonicals, hreflang, sitemap, RSS, schema). Change the apex redirect in `next.config.mjs` to `permanent: true` (308). Verify one canonical host everywhere. |
| **C2** | Homepage and coin pages have no server-rendered primary content and no H1 | `/` raw HTML: 343 words, 0 `<h1>`, no price token. `/coin/nano`: 2 words of main text, 0 `<h1>`, 0 JSON-LD. `/dominance`, `/milestones`: no figures in SSR HTML. 0 H1 in `/de`, `/fr` too. | Render a cached snapshot (price, 24h, market cap, rank) from the prefetched query on the server, add a real `<h1>`, and keep the live hook for refresh only. Add 300–500 words of evergreen copy under the chart. |

---

## High

| # | Finding | Evidence | Fix |
|---|---|---|---|
| **H1** | Triple-branded, overlong titles | `nano-sdk v2… \| NanoMarketCap News \| NanoMarketCap`; `Nano Price Chart \| NanoMarketCap \| NanoMarketCap`; 22/32 doubled, 18 >60 chars, max 109 | Use `title: { absolute: ... }` or remove brand from page-level titles; keep one suffix in the layout |
| **H2** | Duplicate H1 on every article, plus 1:1 contrast hero | `/news/nano-sdk-v2-beta-1` has 2 `<h1>`; hero title is white on white before the image paints | Keep one semantic H1 in the body; make the hero a `<div>`/`<p>`; add a dark scrim |
| **H3** | Malformed article image + SVG OG endpoint | `"image":"https://nanomarketcap.comhttps://nanomarketcap.com/api/og?slug=..."` on all articles; `/api/og` returns `image/svg+xml`, 1,728 B | Build the URL once (`image: [ogImage]`) and return PNG 1200x630 (and 1:1 / 4:3 variants) via `next/og` |
| **H4** | Article schema incomplete and locale-mismatched | No `dateModified`; `mainEntityOfPage` on `/es/...` points to the EN URL; `author: Person "NanoMarketCap Team"`; `publisher` is a duplicate inline Organization with no `@id` | Add `updated` frontmatter, emit `dateModified`, make `mainEntityOfPage` locale-aware, type the team as `Organization`, reference `#organization` by `@id` |
| **H5** | No trust surface | `/about`, `/contact`, `/authors` all 404; About is a client modal; `/legal/imprint` names only Vercel | Publish `/about` (operator, data sources, methodology), `/contact`, `/authors/[slug]`, `/editorial-policy`; add the operator to the imprint |
| **H6** | Sitemap is inaccurate and incomplete | `lastmod` = request time (changed from `…19:05:59` to `…19:13:03`); 18 coin URLs and 9 nav/tool pages missing; no `x-default` | Per-route `lastmod` from content metadata or omit; enumerate `CRYPTO_IDS × LOCALES`; add the nav/tool routes; add `x-default` |
| **H7** | Mobile performance fails | Lab mobile **51**, LCP 4.3 s, TBT 3,000 ms; 3.4 s React-DOM bootup; 89 KB + 33 KB JS ~99% unused; 599 KB HTML, 177 KB inline CSS; 3,088 DOM nodes | Lazy-load Recharts/ledger below the fold, split the unused barrel, remove one 110 KB sync script, revisit `inlineCss` |
| **H8** | `/coin/xno` returns 500 | 500 for `/coin/xno`; 200 for `/coin/nano`; unknown ids also 500 with `index, follow` | Guard unknown ids with `notFound()`; 301 `/coin/xno` → `/coin/nano` |
| **H9** | Pagination is a crawl trap | `?page=2` canonicalizes to page 1, `?page=99` and `?page=abc` return 200 | Self-canonical page 2+; 404 or redirect out-of-range/non-numeric values |
| **H10** | Crawler policy contradicts itself | `robots.txt` allows GPTBot/ClaudeBot/PerplexityBot; burst requests from one IP returned **429** with `Retry-After: 14`; `GoogleOther` is fully disallowed | Raise per-agent budgets for declared AI search crawlers in the edge/WAF; decide intentionally on `GoogleOther` |
| **H11** | Locale formatting bug | `market-overview.tsx:220,225` call `formatFiatPrice()` without `locale`; rendered DOM showed `$0,34` beside `$45.90M` | Pass `locale` from `useLocale()`; audit every `toLocaleString(undefined)` in `currency-helpers.ts` |

---

## Medium

| # | Finding | Evidence | Fix |
|---|---|---|---|
| M1 | Organization schema is thin | No `sameAs`, no `contactPoint`, logo is `X_abstract.svg` | Add real social profiles and a 512x512 PNG logo |
| M2 | Missing structural schema | No BreadcrumbList anywhere; `/news` has 0 JSON-LD; `/coin/nano` has 0 | Add BreadcrumbList, `CollectionPage`+`ItemList`, and a `WebPage`/`FinancialProduct` coin node (no Offer/Review) |
| M3 | No AI/API discovery layer | `/llms.txt` 404, Markdown negotiation returns HTML, `/.well-known/api-catalog` 404, cache-busted API GET returns 403 | Publish `llms.txt` + OpenAPI, allow read-only GETs without `Origin`, add `Vary: Origin, Referer` |
| M4 | Hreflang placement and duplication | HTML hreflang sits at byte ~180k inside `<body>`; header set uses www while HTML uses apex | Emit one set from `SITE_URL` in `<head>`; drop the other |
| M5 | Locale redirect is cache-unsafe | `/` 307s to `/de` on `Accept-Language` with no `Vary: Accept-Language` and `s-maxage=300` | Add `Vary` or make the redirect non-cacheable |
| M6 | Case variants are indexable | `/News`, `/Widgets`, `/WIDGETS` all 200 | 308 to lowercase in `proxy.ts` |
| M7 | Wrong `og:url` on locale routes | `/nl` → `og:url=https://nanomarketcap.com`; `/es/news` → `/news` | Build from the locale-aware path |
| M8 | Content depth is uneven | 16 articles, avg 541 words (354–835); explainers at 354–393; 5 drafts at 200–305 | Keep 350–600-word news briefs; write 1,000+ word evergreen explainers; do not publish the thin drafts |
| M9 | Uncited claims and missing disclaimer | 3 articles have zero outbound sources; the $1B price-scenario article has no "not investment advice" line | Primary-source links on every protocol/financial claim; shared `<Disclaimer />` |
| M10 | News hub is stale and bare | Newest post 2026-08-30 (51 days); `/news` has no intro, no ItemList, cards are H3 | 2 posts/week; 100–150-word intro; schema; freshness line |
| M11 | Brand entity ambiguity | "nano market cap" SERP includes Nano Labs (NA) and Nano One Materials (TSX:NANO); site never disambiguates | Add one line and a Q&A block: "Nano (XNO) is not Nano Labs or Nano One Materials" |
| M12 | Visual legibility and targets | 9–12px mono dominant; green 2.79:1 and blue 3.0:1 on white; 27/39 mobile targets <44px; promo strip truncates to "Widgets are live · E…" | Darken tokens, raise labels to 12px, 44px targets, shorten/hide promo on mobile |
| M13 | Image delivery | 0 `<img>` on home/coin; 191 KB JPG with `max-age=0`; no article cover images for Discover | AVIF/WebP + immutable cache; add 1200x630 covers |
| M14 | Duplicate domain | `www.xnomarketcap.com` returns 200 with identical markup and the same canonical | 301 the mirror to the primary host |
| M15 | No IndexNow | No key file or submission endpoint | Add key + POST on publish (Bing/Yandex/Naver) |
| M16 | Accessibility tree fails | `aria-hidden-focus` on the duplicated ticker; unnamed currency `combobox`; Lighthouse Agentic 1/2 | `inert` the ticker clone; `aria-label="Primary currency"` |

---

## Low

- `sitemap.xml` still emits `priority` and `changefreq` (ignored by Google).
- RSS is healthy but not advertised in `<head>` or `robots.txt`.
- `NEXT_LOCALE` cookie lacks `Secure` and `Max-Age`.
- No `Cross-Origin-Resource-Policy` header.
- 404 bodies vary from 7 KB to 241 KB (status codes are correct).
- Article thumbnails are preloaded but unused (`link rel=preload` warnings).
- No news sitemap — defensible at current publishing cadence.
- No WebMCP/ai-catalog — correct to omit until a real agent surface exists.
- Market table lacks `<caption>`/`scope`; SSR headers are skeletons.
- `/en` → 307 and trailing-slash 308s behave correctly.

---

## Synthesis

**PERCEIVE.** Raw HTML, rendered HTML, screenshots (8 captures), schema, sitemap, SERPs for four priority queries, AI-crawler fetches, and Lighthouse mobile/desktop were collected without scoring. The assumption being surfaced: that apex-vs-www is an unintentional config drift, not a deliberate split. If it is deliberate, C1's fix changes direction but not urgency.

**LISTEN.** The SERP for "xno price" and "nano price chart" wants a single-asset coin page with price, 24h change and a chart above the fold. This site is a cross-asset ledger where XNO prices everything else. The correct page (`/coin/nano`) exists and is well built — it is simply orphaned from the sitemap and invisible in raw HTML. The editorial voice is genuinely good: direct leads, sourced numbers, honest caveats ("six unique payers is not adoption"). Do not rewrite it.

**THINK.** The highest-leverage constraint is C2, not performance. A fast page that contains no crawlable answer cannot rank for "what is the XNO price". C1 is second because it makes every URL signal self-contradictory. Everything else is downstream.

**CONNECT.** The content, GEO, agentic and SXO audits independently found the same missing numbers; that is one server-rendering defect, not four. The malformed schema image and tripled titles share a template-composition root cause. Fixing C1 unblocks sitemap, hreflang, OG URLs and schema IDs in one deploy.

**VALIDATE.** Server-rendering a snapshot must not remove the live ticker — keep hydration for refresh, render the first paint from cache. Trust pages require operator information the owner may not want public; surface that decision rather than forcing it. Contrast and type changes should be token changes, not a redesign of a distinctive visual language.

**ACCEPT.** Every recommendation below carries a falsifier. If the host fix does not reduce "Page with redirect" in GSC after four weeks, the hypothesis was wrong. If TBT stays above 600 ms after deferring Recharts, the bottleneck is not the chart library.

---

## Action plan

### Phase 0 — today (parallel, ~half a day)

| Action | Depends on | Falsifier | Monitor |
|---|---|---|---|
| Set production `NEXT_PUBLIC_SITE_URL` to `https://www.nanomarketcap.com`; make apex→www a 308 | none | GSC "Page with redirect" for canonical URLs does not fall within 4 weeks | Canonical = served host; sitemap URLs return 200 without a hop |
| Fix article schema image double-prefix; return PNG from `/api/og` | none | Rich Results Test still rejects the article image after fix | Rich Results Test on one article |
| Use absolute titles; strip the brand from page-level titles | none | CTR on affected URLs does not move in 4 weeks | GSC average CTR for `/news/*` |
| Remove duplicate H1 from the article template | none | Two H1s persist in rendered HTML | `grep -c '<h1'` on article HTML |

### Phase 1 — week 1

| Action | Depends on | Falsifier | Monitor |
|---|---|---|---|
| Server-render price, market cap, rank, H1 and a 40-word answer sentence on `/` and `/coin/[id]` | C1 for absolute URLs | Raw HTML still lacks a price token after deploy | `curl` a no-JS fetch; AI crawler extraction |
| Add 300–500 words evergreen copy to homepage and every coin page | Phase 1 render work | Impressions for "nano market cap" do not rise in 6 weeks | GSC impressions/clicks |
| Add coin + nav/tool URLs to sitemap; replace request-time `lastmod` | C1 | Sitemap still lists fewer than 60 canonical URLs | Sitemap coverage vs route manifest |
| 404 unknown coin ids; 301 `/coin/xno` | none | 500s persist on unknown ids | Crawl status codes |
| Self-canonical pagination; 404 out-of-range pages | C1 | `?page=99` still returns 200 | GSC "Soft 404" / crawl stats |
| Pass locale to all currency formatters | none | Mixed separators still appear in rendered DOM | Visual check in EN/DE |
| Defer Recharts/ledger; split unused chunks; drop the sync 110 KB script | Phase 1 render work | Mobile TBT stays >600 ms | PSI mobile TBT/INP proxy |
| Publish `/about`, `/contact`, `/authors`, editorial policy; add `Organization.sameAs` | operator info | Brand queries still return no owned entity page | Brand SERP + GSC branded impressions |

### Phase 2 — weeks 2–4

- Article schema graph: `@id` references, `dateModified` from frontmatter, locale `mainEntityOfPage`, one author entity.
- BreadcrumbList, `/news` CollectionPage, coin `WebPage` + `FinancialProduct` (no Offer/Review).
- Reduce HTML weight: inline CSS experiment, RSC payload, DOM count; AVIF + immutable cache for article images; add covers.
- Crawler policy: raise AI-crawler budgets, add `llms.txt`, decide on `GoogleOther`, add IndexNow.
- Content: 2 posts/week, external citations, disclaimers, entity disambiguation, news-hub intro.
- Visual: contrast tokens, 12px floor for data labels, 44px targets, mobile promo strip.
- 301 `xnomarketcap.com` → primary host.

### Phase 3 — backlog

Markdown twins, OpenAPI + `api-catalog` + CORS for read-only endpoints, WebMCP if the currency selector should become agent-addressable, news sitemap once cadence supports it.

---

## What this audit could not measure

- **No Google credentials:** GSC, CrUX, GA4 and Indexing API unavailable. PSI returned HTTP 429 (quota). All performance numbers are lab, not field; there is no field INP.
- **No backlink APIs:** only Common Crawl + verification crawler were available. No DA/PA or referring-domain profile.
- **No DataForSEO / Firecrawl:** SERP analysis came from public search results, not live rank tracking.
- **Mobile double-paint artifact:** screenshots showed elements painted twice in Playwright mobile emulation. Metrics were correct, so it is likely an emulation artifact — confirm on a physical device before acting.
- **No live LLM citation testing**, no Bing index status, no real-device CLS verification.

No code changes were made. The highest-leverage next step is Phase 0: one environment value, one redirect, and two template bugs.
