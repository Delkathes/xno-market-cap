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
| 2026-08-26 | Plan created from brainstorm session; user chose "all phases" + RSS only (no weekly roundup) |
| 2026-08-26 | Phase 1 shipped (1.1, 1.2, 1.3, 1.5). 1.4 (reactions) built with localStorage then REMOVED same day — useless without a DB. Feed moved outside [locale] group (middleware matcher skips dotted paths). 1.6 held |
| 2026-08-26 | Milestone tracker redesigned into instrument band (count-up, labeled ticks, glowing marker, change chips, $1B story link). Pace estimate declined by user |
| 2026-08-26 | Milestone gauge hover tooltip shipped: implied cap + 1 XNO price at cursor (free-follow, cap+price per user choice) |
| 2026-08-26 | Tooltip font 10px→xs; tracker moved into MarketOverview (same space-y-4 rhythm, skeleton mirrors it) |
| 2026-08-26 | Gauge now follows primary fiat (all values + tooltip converted; ratio preserved). "NOW $xxM" footer item replaced by the shared CurrencySettingsPopover (hover-reveal on desktop, always visible on mobile); milestoneNow key removed |
| 2026-08-26 | Market cap panel: removed unconditional USD row (only selected currencies now, max 3 lines). Gauge footer: new compact PrimaryCurrencySelect (primary fiat only, shared atom) |
| 2026-08-26 | Milestones now currency-native (round targets per currency: 1B/2B/5B USD-EUR-GBP-CHF-CAD-AUD, 10B/20B/50B JPY); selector always visible in gauge footer |

## Challenges / decisions log

- [x] Reactions backend: was Option B (localStorage) per no-DB directive; feature REMOVED 2026-08-26 as useless without shared counts. GitHub-file POST /api/reactions remains the documented upgrade path if revisited
- [x] RSS route placement: middleware `matcher` excludes dotted paths → route must sit at `src/app/rss.xml/route.ts`, not inside `[locale]`
- [x] `'use cache'` cannot wrap a Response-returning route handler (prerender "plain objects" error) → inner `getAllNews` cache + CDN Cache-Control instead
- [ ] Decide on 1.6 Vercel Web Analytics (needed to measure retention gains)
- [x] LAN/Tailscale dev testing (2026-08-26): four gotchas. (1) `upgrade-insecure-requests` in the CSP forced every subresource to https on plain-http non-localhost origins (browsers exempt localhost but not Tailscale/LAN IPs) → broken CSS; now production-only in next.config.mjs. (2) `fetchMarketData` prefixed `NEXT_PUBLIC_SITE_URL` (localhost) in dev → phone fetched its own localhost; now relative on the client, absolute only during SSR. (3) Next dev blocks dev resources (HMR ws) from non-localhost origins → client never hydrated on the phone (skeletons forever, empty SelectValue); fixed with `allowedDevOrigins: ['100.80.26.88']` in next.config.mjs. (4) `/api/market-data` 403'd any request carrying an `Origin` header (mobile Safari sends Origin on same-origin GETs) → `isAllowedOrigin` now also accepts the request's own Host header in development only; prod allowlist unchanged. KNOWN: pre-existing hydration mismatch in MarketOverview (DomRow widths: server 'use cache' data vs client refetch) — console noise only, present on localhost too, not fixed yet
