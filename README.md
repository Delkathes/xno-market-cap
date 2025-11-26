# NanoMarketCap

A cryptocurrency market tracker that displays all market data relative to XNO (Nano) instead of USD. See the world through XNO-colored glasses.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDelkathes%2Fxno-market-cap&env=COINGECKO_API_KEY,NEXT_PUBLIC_DONATION_WALLET,NEXT_PUBLIC_APP_URL&envDescription=API%20keys%20and%20configuration%20for%20XNO%20Market%20Cap&envLink=https%3A%2F%2Fgithub.com%2FDelkathes%2Fxno-market-cap%23environment-variables)

## Features

- **XNO-Centric View**: All prices and market caps displayed in XNO
- **Market Overview**: Total market cap, XNO price, and dominance metrics
- **Speculation Tool**: See XNO's potential price at different market cap levels
- **Multi-Currency Support**: Toggle between USD, EUR, GBP, JPY, CHF, CAD, AUD
- **Real-Time Updates**: Live data from CoinGecko with 60-second refresh
- **Donation System**: Built-in XNO donation flow with WebSocket payment monitoring

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `COINGECKO_API_KEY` | Yes | Your CoinGecko API key (free tier available) |
| `NEXT_PUBLIC_DONATION_WALLET` | No | XNO wallet address for donations |
| `NEXT_PUBLIC_APP_URL` | No | Your app URL (for API origin validation) |

## Tech Stack

- Next.js 15 + React 19
- TailwindCSS + shadcn/ui
- Tanstack Query for data fetching
- Jotai for state management
- Valibot for validation

## License

MIT
