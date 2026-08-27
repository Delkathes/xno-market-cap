# SEO Off-page: GSC setup + outreach drafts

Status: drafts for the site owner to submit. Last updated 2026-08-27.

## 1. Google Search Console setup

1. Sign in to https://search.google.com/search-console with any Google account.
2. Click "Add property" -> Domain, enter the domain (no subdomain), and verify via
   DNS TXT record (recommended, covers all subdomains, no code change).
   - Alternative "URL prefix" method (https://www.example.com): Google offers an
     HTML file download or meta tag. If you pick the meta tag, paste it into the
     `<head>` of `src/app/[locale]/layout.tsx` and it will apply to all locales.
3. Once verified, submit the sitemap: `https://example.com/sitemap.xml`
   (already emits only published routes; 15 articles x 6 locales + core pages).
4. Wait 2-4 weeks for data, then check:
   - Performance report, filter query "nano market cap" -> impressions + avg position.
     This number decides how hard to chase the head term.
   - Performance report, filter query "nanomarketcap" -> brand traffic baseline.
   - Indexing report -> watch for "Crawled - currently not indexed" on the
     `(with-prefetched-data)` routes (legacy folder name leaking into URLs is a
     known risk if the group segment ever changed; currently URLs are clean).

## 2. Outreach: hub.nano.org developer/tools listing

Subject: Tool listing suggestion: NanoMarketCap (live market data + calculators)

Hi,

I'm the maintainer of NanoMarketCap (https://example.com), a Nano-focused market
dashboard: live XNO price, market cap and dominance, a scarcity parity calculator,
a market-cap milestone tracker, an RSS feed and a weekly news section. All data is
fetched live from CoinGecko and public Nano RPC nodes, and the site is fully open.

I'd love to see NanoMarketCap listed on the hub.nano.org developer/tools page.
It's free, ad-free and available in six languages (EN, FR, DE, ES, IT, NL).

Is there a process for adding community tools to the list?

Thanks,
[Your name]

## 3. Outreach: nano.org resources

Subject: Resource suggestion: NanoMarketCap

Hello,

I'd like to suggest adding NanoMarketCap (https://example.com) to the nano.org
resources section. It provides live Nano price and market cap data, a scarcity
parity calculator, and a representative voting weight dashboard, all free with no
ads or tracking.

Happy to provide any details or answer questions.

Thanks,
[Your name]

## 4. GitHub: "awesome-nano" listing PR

Title: Add NanoMarketCap (market data, calculators, rep dashboard)

Body:

Adds [NanoMarketCap](https://example.com) to the market data / tools section:

- Live XNO price, market cap, dominance and milestone tracker
- Scarcity parity calculator ("what would 1 XNO be worth")
- Nano decentralization dashboard: representative voting weight, principal rep
  count, top-10 concentration and Gini coefficient, from public RPC nodes
- Free, ad-free, no tracking; EN/FR/DE/ES/IT/NL

## 5. r/nanocurrency announcement (post on dashboard launch)

Title: I built a live Nano decentralization dashboard (voting weight, principal reps, Gini)

Body:

NanoMarketCap now has a decentralization page: https://example.com/decentralization

It shows, live from public Nano RPC nodes:
- Total online voting weight (currently ~89M XNO)
- Principal representative count (reps above 0.1% of online weight)
- Top-10 concentration and a voting weight Gini coefficient
- The top 50 representatives ranked by weight

Nothing to install, no tracking, and it refreshes hourly. Feedback welcome,
especially on what metrics would be most useful next.

## 6. Nano Discord announcement

Check the #show-your-work or #general channel rules before posting.

"Just shipped a Nano decentralization dashboard on NanoMarketCap: live voting
weight, principal rep count, top-10 concentration and a voting-weight Gini
coefficient, straight from public RPC nodes. https://example.com/decentralization
Feedback welcome!"
