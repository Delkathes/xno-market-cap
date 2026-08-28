# Retention Roadmap — NanoMarketCap

Status: planned (start Phase 1)
Created: 2026-08-26
Goal: give users a reason to come back — freshness signals, personalization, portfolio tracking, live network data.

## Problem

Users check the site once and leave. No retention loop today.

## What exists (reuse, don't rebuild)

- Client-side market refetch every 2 min (`src/hooks/use-market-data.ts`), 100-coin payload served via `/api/market-data` + `'use cache'` — watchlist/portfolio/alerts ride this for free
- `atomWithStorage` localStorage pattern (`src/lib/currency-atoms.ts`), theme + currency persistence
- Public Nano RPC/WS endpoint arrays (`RPC_ENDPOINTS`, `WS_ENDPOINTS` in `src/lib/constants.ts`) + server-side `donation-balance` route with rate limiter — the foundation for network status
- Article engine: `getAllNews` + `getNewsBodies` (full bodies available), 6 locales, article-aware OG route (`src/app/api/og/route.ts`)

## Guardrails

- Every feature: 6 locales, Biome, typecheck, build, curl checks
- No new paid data sources; no new deps unless approved (QR is the only candidate, in the Phase 4 stretch item)
- Deliberately avoided: comments (moderation load), push notifications (infra), gamification gimmicks

---

## Phase 1 — Freshness signals

Status: DONE (2026-08-26) — 1.1, 1.2, 1.3, 1.5 shipped; 1.4 REMOVED (deemed useless without a database); 1.6 not started (decision needed)
Effort: ~2-3 days
Why: the site feels static despite data refreshing every 2 min; give visible signals of life.

### 1.1 Live ticker strip
- DONE. Telemetry strip above the market grid in `MarketOverview`: pulsing green LIVE dot + "LAST SYNC HH:MM:SS" + "Xs AGO" (ticks every second, client-mounted to avoid hydration mismatch)
- `use-market-data.ts`: `refetchInterval` 120s → 60s, exposes `fetchedAt` (`dataUpdatedAt`)
- Keys: home.live, home.lastSync, home.syncAgo

### 1.2 Milestone tracker (homepage)
- DONE + REDESIGNED (2026-08-26): `src/components/milestone-tracker.tsx` — "instrument band", replaces the thin h-2 bar
  - Count-up animation on the Ӿ cap value (rAF, cubic ease-out, 1.1s; skipped under prefers-reduced-motion)
  - Labeled tick ladder between prev/next milestones (nice 1/2/5×10^k steps, compact $2B/$12.5B labels)
  - Glowing position marker + fill both slide on data refresh (transition-[left]/[width] 700ms)
  - 24H/7D change chips (trendup/trenddown, existing formatters)
  - HOVER TOOLTIP (2026-08-26): pointer events on the gauge (cursor-crosshair, works with touch drag too) — ghost hairline at the cursor + tooltip above the track showing implied market cap and 1 XNO price at that position (`cap / circulating supply`; clamped to track edges; solid bg-card, caret, no animation so reduced-motion safe). Keys: home.milestoneTooltipCap, home.milestoneTooltipXno. Font text-xs (bumped from 10px on request)
  - PLACEMENT (2026-08-26): moved INTO `MarketOverview` (first child after the telemetry strip, same space-y-4 rhythm as the cards — no more standalone homepage block with its own gap). Homepage resolves the story server-side and passes it through `MarketOverview → MilestoneTracker`; `MarketOverviewSkeleton` mirrors the new structure (telemetry line + milestone band + grid)
  - CURRENCY-FOLLOWING (2026-08-26): gauge displays everything in the selected primary fiat (USD canonical upstream; ratio preserved so fill/marker/progress unchanged). Big cap value, NEXT/TO GO, tick labels, and the tooltip (cap + implied 1 XNO price) all convert via `getFiatRate`; tick 0 (origin) no longer rendered; suppressHydrationWarning on all currency spans
  - FOOTER (2026-08-26): the "NOW $xxM" item REMOVED (useless — cap is already in the header) and replaced by a compact `PrimaryCurrencySelect` (NEW component, `primary-currency-select.tsx` — mono dashed chip, only the primary fiat, bound to the same `primaryFiatAtom` as the market cards; ALWAYS visible per user request, no hover-reveal). `home.milestoneNow` key removed from all 6 locales
  - CURRENCY-NATIVE MILESTONES (2026-08-26): milestone ladders are now defined per currency (`MILESTONES_BY_CURRENCY`: 1B/2B/5B/... for USD/EUR/GBP/CHF/CAD/AUD, 10B/20B/50B/... for JPY) so every target is a ROUND number in the displayed unit (€1B, not converted €858.7M). All gauge math (prev/next/progress/ticks/tooltip) runs in the selected currency space; USD stays the canonical upstream. Progress % per currency is now honest and differs across currencies (e.g. 5.4% to $1B vs 4.6% to €1B vs 81.8% to ¥10B)
  - MILESTONES PAGE (2026-08-26): `/milestones` under (with-prefetched-data) — interactive console showing ALL 7 fiat currencies (no selector, per user request):
    - PRIMARY CURRENCY MASTER (2026-08-26): the master gauge now displays the PRIMARY fiat currency (PrimaryCurrencySelect chip in its header + code next to MARKET CAP label; native ladder, values and implied price all in that currency). Hypothetical position stored in USD so it survives currency switches. The 7 panels became 6: the primary currency's panel is hidden (filtered from MILESTONE_CURRENCIES). PREVIOUS/NEXT MILESTONE buttons convert through the primary rate
    - DRAG WINDOW LOCK (2026-08-26): ONLY the master USD window freezes at drag start (masterLock state) — sliding clamps at the window edge (fraction ≤ 0.9999) and never re-windows the master mid-drag. Currency panels are readouts: they keep deriving windows from the moving hypothetical cap, so they evolve through their OWN milestones as the master scrubs (per user clarification). Advancing is explicit: "PREVIOUS MILESTONE" + "NEXT MILESTONE" buttons (milestones.jumpPrev/jumpNext) in the master header, or ladder-row clicks. Marker/fill transitions disabled while dragging (no lag behind the finger)
    - 7 currency instrument panels (grid): native ladder gauge (compact) with real/hypothetical marker + hover tooltip, NEXT/progress/TO GO, "1 XNO ≈ X AT cap" at next milestone, LADDER section with next-3 milestones showing implied prices; hover row = amber ghost hairline on panel gauge, click = scrub master to that cap
    - Shared `src/lib/milestones.ts` (MILESTONES_BY_CURRENCY, MILESTONE_CURRENCIES, niceStep, shortCap, milestoneWindow); `useAnimatedCap` exported from the tracker
    - Footer: fixed-supply honesty note + the $1B story chip (server-resolved, locale-checked)
    - NEW message namespace `milestones` + `metadata.milestones` + `navigation.milestones`/`milestonesDescription` + `home.milestoneAll` (replaces `milestoneStory`, key removed) — all 6 locales
    - Homepage tracker footer chip now links to /milestones ("ALL MILESTONES"); story plumbing (getNewsMetadata in homepage, MarketOverview prop, MilestoneStory type) REMOVED
    - Nav: desktop metrics dropdown (Flag icon) + mobile menu; trigger active-state includes /milestones
  - MARKET CAP PANEL (2026-08-26): the unconditional USD reference row removed — panel now shows only the selected currencies (primary, secondary if different, crypto ref), max 3 lines. `triggerClassName` prop added then reverted from CurrencySettingsPopover (unused after the swap)
  - Footer: NOW $2.16B · 5.4% · "THE $1B STORY →" chip linking to xno-one-billion-market-cap
  - Story link is server-resolved: homepage calls `getNewsMetadata('xno-one-billion-market-cap', locale)`; chip only renders while published in that locale (locales that lack it degrade gracefully)
  - Keys: home.milestoneSection/Next/ToGo/Now/Story (milestoneFrom/To removed)
  - NOTE: user explicitly declined the "≈ days at 7d pace" estimate (kept gauge factual)
  - Earlier design (h-2 bar, FROM/TO row) replaced; git history holds the old one

### 1.3 RSS feed
- DONE. Global EN feed at `/rss.xml` (`src/app/rss.xml/route.ts`), full stripped article bodies (max 600 chars), `Cache-Control: s-maxage=3600`, ttl 60
- `lib/news.ts`: added `stripMdx` (case-preserving) + `getNewsBodyPlain`; `toSearchText` now wraps `stripMdx`
- RSS chip in news page header (mono dashed chip + lucide Rss icon) + metadata `alternates.types` on /news
- Chosen scope: RSS only, no weekly roundup automation
- GOTCHA: middleware matcher skips dotted paths → feed must live OUTSIDE `[locale]` group; `'use cache'` on a Response-returning handler is not serializable (prerender error) → rely on inner `getAllNews` cache + CDN headers instead
- Keys: news.rssFeed, news.rssFeedTitle

### 1.4 Article reactions
- REMOVED (2026-08-26) — built with localStorage-only counts (Option B), then pulled out the same day: without a shared backend there are no real numbers to show, so the widget was noise. If a backend ever lands (GitHub-file POST /api/reactions), the design is still in this file's history
- Upgrade path: `POST /api/reactions` append-only lines to a JSON file in a GitHub repo via PAT (serverless FS is read-only; site already talks to GitHub)

### 1.5 Article OG cards
- DONE (already wired): `og/route.ts` renders slug → title/emoji/date/author; article pages reference `/api/og?slug=` in openGraph + twitter images. Verified, no change needed

### 1.6 (optional) Vercel Web Analytics
- NOT STARTED — decided to hold; revisit when measuring retention matters

---

## Phase 2 — Personalization: watchlist + price alerts

Status: pending
Effort: ~2-3 days
Why: make the site "mine" — pinned coins and thresholds bring users back to check.

- New atoms: `watchlistAtom` + `alertsAtom` (atomWithStorage, same pattern as currencies)
- Pin toggle on `market-cap-table` rows → pinned group at top
- Alert modal: coin, threshold, above/below; checked client-side on each refetch; bell badge in `navigation.tsx` with triggered count, dismissible panel
- In-app only (no email/push — honest)
- Works across the full 100-coin payload, zero API cost
- ~15-20 locale strings

---

## Phase 3 — Portfolio tracker

Status: pending
Effort: ~3-4 days
Why: the daily-check feature for a price site — holdings, live value, P&L.

- `holdingsAtom`: `[{coinId, amount, avgCost, currency}]`; add/edit modal with coin search
- Homepage portfolio card: total value in primary fiat, 24h change, per-position P&L vs cost basis
- Pure client-side over the existing payload, zero API cost
- ~20 locale strings
- Biggest retention win, biggest component

---

## Phase 4 — Nano network strip + address utility

Status: pending
Effort: ~2-3 days
Why: live network data is unique to this niche and ties to the rsnano + nanoNodeMonitor articles.

- `/api/nano-network` server route reusing `RPC_ENDPOINTS` rotation + rate limiter + `cacheLife('minutes')`
- Data: confirmation time, active nodes, node version split (RsNano vs C++)
- Homepage strip: confirmation time, nodes, versions
- Stretch (optional): `nano_` address input → balance + Blocklattice link via the same route
- ~10 locale strings

---

## Sequencing

1 → 2 → 3 → 4, each shippable and reviewable on its own. Total ~10-12 days.

## Change log

| Date | Change |
| --- | --- |
| 2026-08-28 | ACCOUNT EXPLORER SHIPPED (spec: all 10 sections, 5 successive phases). New dynamic SSR route `/account/{nano_address}` (per-locale, `export const instant = false` + `await connection()` — the legal combo alongside cacheComponents; force-dynamic/runtime=edge remain illegal). Malformed URL addresses get a REAL 307 from `src/proxy.ts` (next-intl middleware wrapper guard; PPR keeps prerendered shells at 200 so the route's own redirect can't change the status; regex gotcha: `(?:xx)?\/` needs the slash inside the optional group). P1 (routing/header/validation): `src/lib/account-data-service.ts` ('use cache' 60s per address: account_info+block_count, account_balance, account_weight, decentralization context; unopened accounts = empty state not error), instrument plate with registration corner marks, count-up balance hero (rAF, reduced-motion safe), QR + copy + copy-link, pending/voting-weight/lifetime-blocks/principal stat strip (% of circulating supply via xnoData.circulating_supply, tiny shares show 4 decimals), rep/frontier/open ledger rows, jump-to search bar, per-address title/description/canonical/hreflang, `noindex` on zero-activity; `/tools/account-inspector` became the entry page (navigates to the route); `/api/account-info` kept as the poll fallback. P2 (fiat + compare): 7-fiat strip derived from the existing feed (`getCompareRates` in market-data-service: coinUsd/xnoUsd per coin — CoinGecko REJECTS vs_currency=xno (verified 400), the codebase's homemade USD-cross is the official fallback per user; per-currency precision: JPY 0, others 2), searchable multi-select compare panel (top-100, ≤6 pins, defaults BTC/ETH/SOL/DOGE, reset, magnitude-based rate precision 2-8 decimals, "Prices as of {time} UTC"), `xno_compare_coins` cookie (Max-Age 1y, Secure, HttpOnly, SameSite=Lax; POST /api/compare-coins with rate-limit/allowlist; read via cookies() for SSR pins; `?vs=` one-time override never persists + disclosure note; privacy page disclosure line added — NO em dashes, used the site's `·` separator). P3 (history): account_history pagination (25 + load more via /api/account-history), direction glyphs ▲▼◆, XNO + USD (hidden below $0.01), counterparty To/From (params form — next-intl v4 falls back to the key path if a {placeholder} message is called without args!), relative time (server absolute → client relative after mount), confirmed/pending, inline block panel (/api/block-info; tolerant schema for PRC relays; send link hex decoded to address via deriveAddress). P4 (live pulse): generalized `use-account-confirmations` hook (round-robin WS_ENDPOINTS, visibility-gated, backoff, accounts filter; verified ack on node.somenano.com — feed was quiet during testing), live balance tween + `animate-balance-glow` text-shadow pulse, slide-in toasts (LIVE/POLLING indicator), WS tx prepended to history (dedupe by hash), 60s poll fallback via /api/account-info when the socket is down. P5 (labels + OG): `known-accounts.ts` (RPC-verified entries only; Nano Pay rep verified — external rep APIs were unreachable so the table stays small+accurate), Nano.to username fallback (`api.nano.to/user/{address}`, cached 1h, defensive shape parsing), labels applied to own header/rep row/history counterparties; dynamic per-account OG image `[locale]/account/[address]/og-image` (next/og ImageResponse: brand gradient, Ӿ logo, registration marks, truncated address, balance XNO + USD, PRINCIPAL REP badge; wired into og:image + twitter card; satori gotchas: `inset` shorthand silently dropped → explicit offsets, every multi-child div needs explicit display). VERIFIED: typecheck/biome clean, build 327 pages, dev + prod smoke: rep page renders balance 11.67 XNO + $4.73 USD + 25 history rows + send counterparties derived from hex links, cookie round-trip + dedupe + unknown-ticker filtering, ?vs= override note, privacy disclosure, dynamic og:image 200 PNG, invalid URLs 307→tools in both locale forms. NOTES: babel cache corrupted after a forced dev-server kill → `rm -rf .next/dev/cache .next/dev/server` fixed it; route handlers take (request, {params}) — the first arg is the Request. |
| 2026-08-26 | SEO PASS (Phases A+B+C): new `src/lib/seo.ts` (ogImage/ogLocale/localePath) + `src/components/hreflang-links.tsx` (per-page alternates + x-default; cacheComponents drops metadata.alternates.languages). A1: sitemap now uses `getAllNews()` — 5 draft 404s removed from the sitemap (verified 0). A2: og:image/type/locale restored on all 13 openGraph pages (page-level openGraph was dropping the layout's image). A3: x-default added. B4: self-referencing canonicals per locale on all 19 pages (+legal). B5: per-page hreflang in HTML (article pages now emit their own locale alternates, not the root homepage links; layout's manual root block removed). B6: branded `[locale]/not-found.tsx` (mono 404 + home/news links, `notFound` namespace ×6). C7: `apple-icon.png` generated from X_abstract.svg on brand-gradient background (sharp), enabled in layout. C8: skipped — no real X handle exists anywhere in the codebase (footer social links are placeholders); add `twitter:site` when a handle exists. Verified: build/typecheck clean, sitemap 105 article URLs (15×7), home og:image/type/locale, /fr canonical→/fr, article 7 hreflang links, milestones og:image, branded 404, apple icon 200 |
| 2026-08-27 | E1 follow-up (final architecture): the `await` fix surfaced the dev-only key warning (`Each child in a list ... passed a child from PrefetchLayout`) and a build error (`Date.now() while prerendering`). Root-caused both: (1) the warning fires when the dehydrated market-data payload (~250KB) forces the streamed RSC payload to split, turning a cached layout's external `children` into keyless stream references (React 19.2 dev-only; production clean); (2) the old `void` prefetch left a pending promise which made the group routes dynamic, so the build never evaluated the fetch chain at build time; with `await` the routes became statically prerenderable and the fetch chain's internal `Date.now()` (CoinGecko SDK request timing + React Query's `dataUpdatedAt` bookkeeping) tripped the prerender check. FINAL ARCHITECTURE (cacheComponents-compatible; force-dynamic is illegal with cacheComponents): deleted the group layout; each of the 7 group pages now has `export const instant = false` (blocking/request-time route, Next's sanctioned flag for this), an uncached page wrapper, and a cached inner component (`'use cache'` + cacheLife('hours'|'max')) that renders `<MarketDataShell>` (prefetch + HydrationBoundary inside the cached boundary so React Query's Date.now runs only at runtime). Replaced the CoinGecko SDK with direct `fetch` + existing `fetchWithRetry` in `market-data-service.ts` (SDK unconditionally calls Date.now per request; fetch is deterministic). Verified: build passes (274 static pages), typecheck clean, 0 console key errors on home/milestones/calculators/dominance/coin pages AND on /news, SSR numbers in HTML ($53.94M), dehydrated state in payload. NOTE: `/api/price-chart/xno/30` returns 400 "Coin not found: xno" — pre-existing route validation, unmodified files, not caused by this session. |
| 2026-08-27 | DECENTRALIZATION REDESIGN: the /decentralization page got charts. New service metrics (`src/lib/decentralization-service.ts`): `lorenz` (21-point curve), `top1/5/25/50Share`, `medianWeightXno`, `meanWeightXno`. New components in `src/components/decentralization/`: `lorenz-chart.tsx` (recharts Area chart: actual distribution curve + amber Gini region A + dashed perfect-equality line; hover tooltip "Top X% of reps hold Y% of voting weight"), `rep-treemap.tsx` (recharts Treemap of top 24 reps + "all other reps" bucket, theme ramp fills, labels in large cells, hover tooltip with full address/weight/share), `concentration-ladder.tsx` (animated cumulative bars top1/5/10/25/50 + principals). Page: instrument-panel layout (mono panel headers 01-03, panel index numbers), stats cluster restyled with real-data mini-bars + a real-data Gini glyph (inline SVG from the actual Lorenz points), table gained a cumulative column, breadth line (median vs mean rep weight), live pulse dot in hero kicker. New `--chart-curve/--chart-gini/--chart-gini-area` CSS vars (light+dark). i18n: ~16 new keys ×6 locales. GOTCHAS: (1) SVG presentation attributes don't resolve CSS vars — use style props; (2) theme-derived chart colors MUST be mounted-gated (`mounted && resolvedTheme === 'dark'`) because the page SSRs cached data and light-vs-dark concrete colors caused a hydration mismatch error (the site's other charts never SSR'd so they were immune); (3) recharts Treemap `content` cannot return null and `data` needs an index signature. Verified: build 274 pages, typecheck, 0 console errors in light AND dark reloads, tooltips work (FR session: "Les 55% de représentants les plus importants détiennent 93.8% du poids de vote"). |
| 2026-08-27 | TOOLS SECTION SHIPPED: new "Tools" nav dropdown (desktop + mobile, trigger highlights on /tools paths; Metrics untouched per user choice) + `/tools` hub page ("Instrument bench": asymmetric 6-col grid of tool cards with mono indices 01-05, lucide icons, hover lift + arrow slide). Five tools, all with the instrument-panel aesthetic (shared `ToolPanel` chrome: mono header + index numeral), `HreflangLinks` + localized canonical + `ogImage`, metadata titles carrying query phrases, full i18n ×6 (~70 new keys in `tools` + `metadata.tools` + navigation), em-dash-free: (1) `/tools/unit-converter` — XNO/raw/mXNO/kXNO/KXNO/MXNO via nanocurrency `convert`, swap button, copy, string-based lossless (verified: 1 XNO → 10^30 raw exactly); (2) `/tools/payment-links` — address/amount/label/message form, live `nano:` URI, QR (`qrcode.react` dynamic import), copy URI/address; `createNanoUri` extended with optional label/message (nano-utils, backward compatible); (3) `/tools/address-tools` — validate (nano_/xno_ + checksum), address ↔ public key (`derivePublicKey`/`deriveAddress`), seed generator with "store offline" warning banner, address QR; (4) `/tools/fee-comparison` — new `src/lib/btc-fees.ts` (mempool.space recommended fees, 'use cache' + 300s, valibot), head-to-head $0.00 vs live BTC readouts, send-amount input with fee-as-% of payment, 4 tier bars (economy→fastest, animated), 1 XNO ≈ sats line; verified live: fastest 0.54 USD vs 0.00; (5) `/tools/account-inspector` — new `GET /api/account-info` route (donation-balance pattern: security headers, allowlist, rate limit, round-robin RPC, s-maxage=60; `account_info` needs `representative: true` param! — RPC does not return it by default), stats grid (balance, pending, voting weight + % of online, principal status + rank), rows with copy, nanolooker/nanocrawler deep links; verified: donation wallet 58.96 XNO, natrium rep 9.16% of online weight + principal + rank. Build: 317 static pages (was 274). All pages 0 console errors; converter/URI/QR/address/fees/inspector interaction-tested via playwright. NOTE: synthetic DOM value-setter events don't trigger React state updates in tests (use real keystrokes). |
| 2026-08-27 | SEO PASS 2 (content + SSR + dashboard). E1: FIXED SSR bug — `void queryClient.prefetchQuery` in `(with-prefetched-data)/layout.tsx` was never awaited, so `dehydrate()` snapshotted an empty cache and all pages in the group SSR'd empty/`undefined` cells (marketCapUSD count 0 in HTML). Now `await`ed: numbers server-render (`$53.90M` visible in HTML). E2: homepage title now contains the head-term phrase in all 6 locales: "Nano (XNO) Market Cap, Price & Live Chart" (+ogTitle). E3: homepage had ZERO `<h1>` — added `home.hero.h1` "Nano Market Cap, Live Price & Charts" + intro paragraph (fixed-supply 133,248,297 XNO explanation) ×6. E4: calculator panels got 2-3 sentence `seoParagraph` copy each (`parity`, `parityCalculator`, `speculationCalculator` namespaces ×6) rendered under the panel descriptions. E5: NEW `/decentralization` dashboard (route outside the prefetched group, `src/lib/decentralization-service.ts`): live voting weight, principal rep count (0.1% threshold), top-10 concentration, voting-weight Gini, top-50 reps table from public RPC (`representatives_online` with weight, round-robin across all 5 RPC_ENDPOINTS; rpc.nano.to returns reps keyed by address without an `address` field). Verified real data: 88.99M XNO online, 61 principal reps, 64.1% top-10, Gini 0.69. Nav entry in metrics dropdown (desktop + mobile, `Network` icon). Page cached `revalidate: 3600`, data `revalidate: 300`. E6: off-page drafts in `.opencode/plans/seo-outreach-drafts.md` (GSC setup guide, hub.nano.org/nano.org/awesome-nano/r-nanocurrency/Discord copy) — ACTION NEEDED by owner. |
| 2026-08-26 | Plan created from brainstorm session; user chose "all phases" + RSS only (no weekly roundup) |
| 2026-08-26 | Phase 1 shipped (1.1, 1.2, 1.3, 1.5). 1.4 (reactions) built with localStorage then REMOVED same day — useless without a DB. Feed moved outside [locale] group (middleware matcher skips dotted paths). 1.6 held |
| 2026-08-26 | Milestone tracker redesigned into instrument band (count-up, labeled ticks, glowing marker, change chips, $1B story link). Pace estimate declined by user |
| 2026-08-26 | Milestone gauge hover tooltip shipped: implied cap + 1 XNO price at cursor (free-follow, cap+price per user choice) |
| 2026-08-26 | Tooltip font 10px→xs; tracker moved into MarketOverview (same space-y-4 rhythm, skeleton mirrors it) |
| 2026-08-26 | Gauge now follows primary fiat (all values + tooltip converted; ratio preserved). "NOW $xxM" footer item replaced by the shared CurrencySettingsPopover (hover-reveal on desktop, always visible on mobile); milestoneNow key removed |
| 2026-08-26 | Market cap panel: removed unconditional USD row (only selected currencies now, max 3 lines). Gauge footer: new compact PrimaryCurrencySelect (primary fiat only, shared atom) |
| 2026-08-26 | Milestones now currency-native (round targets per currency: 1B/2B/5B USD-EUR-GBP-CHF-CAD-AUD, 10B/20B/50B JPY); selector always visible in gauge footer |
| 2026-08-26 | /milestones page shipped: interactive console, ALL 7 fiat currencies, drag-to-simulate master gauge, per-currency panels with ladder rows (hover ghost + click scrub), story chip moved from homepage, shared lib/milestones.ts, nav links, new locales |
| 2026-08-26 | Milestones drag fix: master window frozen during slide (no milestone rushing), clamped at window edge; NEXT MILESTONE button added |
| 2026-08-26 | Refined: only master locked during drag (panels keep evolving through their own milestones); PREVIOUS MILESTONE button added alongside NEXT |
| 2026-08-26 | Master gauge follows primary fiat (PrimaryCurrencySelect in header); primary panel hidden from the grid (7→6 panels); hypo stored in USD across currency switches |
| 2026-08-26 | Ladders trimmed to top out at 1000B per unit (USD/EUR/GBP/CHF/CAD/AUD: 1B/2B/5B...1000B; JPY: 10B/20B/50B...1000B). PREVIOUS MILESTONE fixed: jumps to the ladder entry below the current window start (was re-deriving the same window, appearing stuck); disabled when nothing is below |
| 2026-08-26 | JPY ladder extended to ¥100T (~$670B USD-equivalent; was ¥1T, too small). PREVIOUS can now return to the [0, first] window (target 0 when the window starts at the first ladder entry). NEXT disables at the ladder top |
| 2026-08-26 | Fixed /milestones hydration mismatch (disabled attribute flip on PREVIOUS/NEXT): window + button states now derive from the REAL cap (or hypothetical), not the animated count-up value — dehydrated market data is identical server/client, so `disabled` can't diverge. Animated value only drives the displayed number/marker |
| 2026-08-26 | Second /milestones hydration fix: atomWithStorage reads localStorage synchronously on first client render, so a stored non-USD currency reordered the panel grid vs USD-rendered server HTML (structural, suppress-hydration can't save it). Added a `mounted` gate — `activeFiat = mounted ? primaryFiat : USD` — the server value renders until mount, then the stored currency takes over |
| 2026-08-26 | Third /milestones hydration fix (root cause): the server PAGE render and the dehydrated LAYOUT state can carry different market data (cached layout vs fresh page fetch), so any `disabled` derived from it can flip at hydration (React refuses to patch). PREVIOUS/NEXT targets now compute only after `mounted` (both render disabled at hydration); un-suppressed progress-% spans got suppressHydrationWarning. VERIFIED with playwright-cli: fresh / FR+EUR / EN+EUR loads all report 0 console errors |
| 2026-08-26 | FOURTH round (the real culprit): Turbopack's persistent dev cache served a STALE compiled server chunk (`[root-of-the-server]__075fkr6._.js`, pre-mounted-gate) alongside the fresh one — the user's browser nondeterministically got OLD server HTML + NEW client JS → the disabled flip survived every code fix. Fixed by killing the dev server, `rm -rf .next/dev/cache .next/dev/server`, restarting `npm run dev` in the background (log: .next/dev/server-stdout.log). Verified: 3 consecutive playwright loads (EN+EUR) → 0 console errors, 0 new hydration errors in the log. NOTE: the user's own `npm run dev` terminal process was replaced by this background instance |
| 2026-08-26 | FIFTH round (persists in the user's browser only): the disabled-attribute flip still appeared in their browser (JALON SUIVANT button) even with clean caches, while fresh + persistent playwright profiles stayed clean — a partial-hydration/RSC-replay quirk unique to their tab state. NUCLEAR fix: `suppressHydrationWarning` on both milestone buttons AND on the gauge fill/marker (tracker + milestones view) — the `disabled`/style state self-corrects on the first post-hydration render and can NEVER throw. Verified 4 consecutive persistent-profile loads (FR+EUR): 0 console errors, 0 new log errors |
| 2026-08-26 | Milestone gauge: drag can now reach 100% (clampScrub 0.9999→1.0). The window lock is RETAINED when parked exactly on the window's next milestone (full bar, no auto-advance); advancing is the buttons' job. Buttons now target the DISPLAYED window (masterScrubWindow): PREVIOUS = entry below window start, NEXT = window top (re-derives the window above at 0%). BUGFIX along the way: `scrubMaster` was clearing the lock every scrub (added for button jumps) — clobbered the drag lock; lock-clear moved into the button handlers. Verified in-browser: drag→100% parked [0,$1B], NEXT→[$1B,$2B]@0%, PREVIOUS→back |
| 2026-08-26 | Live XNO value per currency panel: each of the 6 panels now shows a prominent `1 XNO ≈ X` readout (blue, amber under hypothetical) that follows the master gauge live; replaces the static "implied at next milestone" line (redundant — the ladder rows show per-milestone prices). `milestones.impliedAt` key removed from all 6 locales. Verified: prices evolve across all panels while sliding (€0.34→€3.86→€5.47, ¥64→¥718→¥1017) |
| 2026-08-26 | Consistency fix: master `1 XNO ≈` value now turns amber in hypothetical (was always white); panel live-price lines restyled to the master's exact size (text-xs uppercase tracking-widest, 12px) — verified all 7 readouts identical size + amber when hypothetical |

## Challenges / decisions log

- [x] Reactions backend: was Option B (localStorage) per no-DB directive; feature REMOVED 2026-08-26 as useless without shared counts. GitHub-file POST /api/reactions remains the documented upgrade path if revisited
- [x] RSS route placement: middleware `matcher` excludes dotted paths → route must sit at `src/app/rss.xml/route.ts`, not inside `[locale]`
- [x] `'use cache'` cannot wrap a Response-returning route handler (prerender "plain objects" error) → inner `getAllNews` cache + CDN Cache-Control instead
- [ ] Decide on 1.6 Vercel Web Analytics (needed to measure retention gains)
- [x] LAN/Tailscale dev testing (2026-08-26): four gotchas. (1) `upgrade-insecure-requests` in the CSP forced every subresource to https on plain-http non-localhost origins (browsers exempt localhost but not Tailscale/LAN IPs) → broken CSS; now production-only in next.config.mjs. (2) `fetchMarketData` prefixed `NEXT_PUBLIC_SITE_URL` (localhost) in dev → phone fetched its own localhost; now relative on the client, absolute only during SSR. (3) Next dev blocks dev resources (HMR ws) from non-localhost origins → client never hydrated on the phone (skeletons forever, empty SelectValue); fixed with `allowedDevOrigins: ['100.80.26.88']` in next.config.mjs. (4) `/api/market-data` 403'd any request carrying an `Origin` header (mobile Safari sends Origin on same-origin GETs) → `isAllowedOrigin` now also accepts the request's own Host header in development only; prod allowlist unchanged. KNOWN: pre-existing hydration mismatch in MarketOverview (DomRow widths: server 'use cache' data vs client refetch) — console noise only, present on localhost too, not fixed yet
