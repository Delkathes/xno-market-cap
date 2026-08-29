# Widgets Roadmap — NanoMarketCap

Status: planned (Phase 1 ready to start)
Created: 2026-08-29
Goal: turn NanoMarketCap into the data + embeddable infrastructure layer for the Nano ecosystem — hundreds of Nano sites (wallets, merchants, faucets, communities, blogs, donation pages) display NanoMarketCap data, each embed carrying non-removable branding and a backlink.

## Positioning

Widgets are a **distribution product**, not an embed feature:

widget → external site → brand exposure → referral traffic → NanoMarketCap

Decision (2026-08-29): all widgets are **localized in all 6 locales** and carry **non-removable NanoMarketCap attribution**. A brandless/Pro tier is deferred until there is adoption evidence.

## What exists (reuse, don't rebuild)

- Market data + exchange rates + all fiat/market-cap formatters (`use-market-data`, `currency-helpers.ts`) → Price / Market Cap / Calculator widgets
- `getAccountData` / `getAccountBalances` / `getAccountChainTimes` + account UI (`account-data-service.ts`, `account-balances-service.ts`) → Account widget
- `getNetworkStats` (`network-stats-service.ts`) → Network stats widget
- `use-network-confirmations` WS hook + explore `live-ticker.tsx` → Live transactions widget (compact variant)
- `qrcode.react` already in use (4 components) + `donation-modal.tsx` / `donation-button.tsx` → Donation widget
- Precedent: site already embeds nanswap iframe — iframe-first is proven here
- "No-jump" skeleton pattern (parity/calculators/milestones) applies to widget pages

## Architecture

### Routes

- Widget index (full site chrome): `src/app/[locale]/widgets/page.tsx` — builder + catalog, localized, indexed
- Embed pages (no chrome): `src/app/[locale]/widgets/embed/{type}/page.tsx` — each `type` is a standalone page, `robots: noindex`, no hreflang
- Embed snippet v1: `<iframe src="https://nanomarketcap.com/{locale}/widgets/embed/{type}?params" loading="lazy">` (locale chosen at build time, default `en`)
- JS SDK: later (P2), iframe only for v1

### Embed mode (no site chrome in the iframe)

`Navigation` and `Footer` hide themselves on widget-embed paths (pathname check, e.g. `startsWith('/widgets/embed')` → render null). No layout restructure. The embed page renders only the widget card + attribution.

### Data: SSR-only, cached — no cross-origin API

Widget iframes live on foreign origins. `isAllowedApiRequest` (request-security.ts) 403s cross-origin calls and API routes set `X-Frame-Options: DENY` + `frame-ancestors 'none'` — so widget pages MUST NOT fetch `/api/*` from the client. Rule:

- All data is baked server-side with `'use cache'` + `cacheLife` (mirrors account/block pages). 100 embeds hit the cache, not CoinGecko/relays; rate limiter untouched.
- Only exceptions: Live transactions widget uses the public WS (no CORS), and the Account widget can run its existing `getAccountData` server-side per render.
- HTML pages carry no frame-busting headers → iframes work out of the box. Verify on first embed page (curl response headers).

### i18n ×6

- New `widgets` message namespace in all 6 locale files (title, labels, attribution, unit strings)
- Embed locale from the URL segment; builder lets the user pick locale → emits localized URL
- Attribution component: "Data by NanoMarketCap ↗" (localized), links to `/widgets`, non-removable

### Params (query string, validated, defaults safe)

Shared: `currency=usd|eur|gbp|jpy|chf|cad|aud`, `compact=1`. Theme: none in v1 — the iframe inherits the visitor's system theme via the existing init script (iframe localStorage is isolated, defaults to system). `theme=` param is a later enhancement.

## Widget catalog

### Phase 1 — Static widgets (SSR + cacheLife, no client fetch)

- [ ] **1.1 Price widget** (`/widgets/embed/price`) — XNO price, 24h/7d change, sparkline, market cap + supply rows. Params: currency, range (24h/7d/30d/1y), compact. Data: `getMarketData` (cacheLife minutes). Chart: reuse sparkline pattern from home/market-overview or a static SVG polyline (no recharts needed — lighter embed).
- [ ] **1.2 Market Cap widget** (`/widgets/embed/market-cap`) — big cap number, rank, 24h change; optional second card "What if Nano had Bitcoin's market cap?" (1 XNO = X). Params: currency, variant.
- [ ] **1.3 Calculator widget** (`/widgets/embed/calculator`) — XNO ↔ fiat amount converter. Params: currency, default amount. Reuses existing converter logic from `/tools/unit-converter`.
- [ ] **1.4 Network stats widget** (`/widgets/embed/network`) — block count, cemented %, online weight, principal reps/share, confirmation latency. Data: `getNetworkStats` (cacheLife 300).
- [ ] **1.5 Widget index + builder** (`/widgets`) — catalog with live previews, copy-paste iframe snippets (dumb form: type, currency, locale, range, compact → code block). No accounts/auth.

### Phase 2 — Live/account widgets

- [ ] **2.1 Account widget** (`/widgets/embed/account?address=`) — shortened address, balance XNO + fiat, block count, rep. SSR via `getAccountData` (instant=false + connection, mirrors account page). Params: address (validated nano_…), currency. Public data only.
- [ ] **2.2 Live transactions widget** (`/widgets/embed/live`) — compact version of the explore ticker (fixed height, WS feed, subtype glyphs, links). Client-only, no CORS issue.

### Phase 3 — Donation widget

- [ ] **3.1 Donation widget** (`/widgets/embed/donate?address=`) — QR + preset amounts (1/5/10/custom) + deep link (nano: URI), "Donate with Nano", address display, "0 fees · instant", attribution. Reuses `qrcode.react` + donation-modal logic. SSR, address param validated.
  - Trust framing: explicit "address provided by site owner" — no implied endorsement, no goal/recent-donations claims in v1 (avoid "Powered by NanoMarketCap" next to scam addresses poisoning the brand).
- [ ] **3.2 (stretch)** Donation goals/recent donations via `account_history` polling on the target address — only if 3.1 gets real usage.

## Guardrails

- Every feature: 6 locales, Biome, typecheck, build, curl checks (status + no frame-blocking headers), Playwright iframe smoke test (height matches, no chrome, attribution visible)
- No new dependencies (QR already in tree); no new paid data sources
- No client-side calls to `/api/*` from embed pages (cross-origin 403 by design)
- Embed pages `noindex`; only `/widgets` is indexed
- Attribution non-removable everywhere (v1)

## Out of scope (later)

- Payments/Payment button (nano.to owns the niche; donation widget covers the use case at 10% complexity)
- Public REST API + API keys
- White-label / Pro tier (brandless widgets, custom logo/colors, analytics) — revisit after adoption evidence
- JS SDK (iframe stays the v1 delivery)
- Accounts/auth in the builder

## Verification checklist (each widget)

1. `curl` the embed URL → 200, correct cache headers, NO `X-Frame-Options`/`frame-ancestors` on the HTML response
2. Playwright: load the embed URL inside an `<iframe>` on a fake external page → widget renders, no site header/footer, attribution link visible, height stable
3. Switch the visitor system theme → widget follows (dark/light)
4. Locale switch (e.g. `/fr/widgets/embed/price`) → translated labels
5. Skeleton→content swap height-stable (no-jump, same pattern as milestones)
6. Typecheck + Biome + production build pass

## Log

- 2026-08-29 — Plan created. Decisions: 6-locale localization; attribution non-removable; SSR+cache-only data (cross-origin API blocked by design); iframe-first; donation widget = trust-framed v1; payments/API/Pro deferred.
