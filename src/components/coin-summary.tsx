import { getTranslations } from 'next-intl/server'

import { FiatCurrency } from '@/lib/constants'
import { formatFiatMarketCap, formatFiatPrice } from '@/lib/currency-helpers'
import { getMarketData } from '@/lib/market-data-service'

export async function CoinSummary({ locale, coinId }: { locale: string; coinId: string }) {
	let coin: Awaited<ReturnType<typeof getMarketData>>['data'][number] | undefined

	try {
		const market = await getMarketData()
		coin = market.data.find((item) => item.id === coinId)
	} catch {
		return null
	}

	if (!coin) {
		return null
	}

	const t = await getTranslations({ locale, namespace: 'metadata.coin' })
	const td = await getTranslations({ locale, namespace: 'coinDetail' })
	const symbol = coin.symbol.toUpperCase()
	const rankLabel = td('rank', { rank: '' })
		.replace(/\s*#\s*$/, '')
		.trim()

	return (
		<section className="animate-fade-in-up border-b border-dashed border-border pb-6">
			<h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
				{coin.name} ({symbol}) {td('price')}
			</h1>
			<p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
				{t('description', { coin: coin.name })}
			</p>
			<dl className="mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
				<div className="rounded-md border border-border bg-muted/30 px-3 py-2.5">
					<dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">USD</dt>
					<dd className="mt-1 font-mono text-lg font-bold tabular-nums">
						{formatFiatPrice(coin.current_price, FiatCurrency.USD, locale)}
					</dd>
				</div>
				<div className="rounded-md border border-border bg-muted/30 px-3 py-2.5">
					<dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
						{td('marketCap')}
					</dt>
					<dd className="mt-1 font-mono text-lg font-bold tabular-nums">
						{formatFiatMarketCap(coin.market_cap, FiatCurrency.USD)}
					</dd>
				</div>
				<div className="rounded-md border border-border bg-muted/30 px-3 py-2.5">
					<dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
						{td('volume24h')}
					</dt>
					<dd className="mt-1 font-mono text-lg font-bold tabular-nums">
						{formatFiatMarketCap(coin.total_volume, FiatCurrency.USD)}
					</dd>
				</div>
				<div className="rounded-md border border-border bg-muted/30 px-3 py-2.5">
					<dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
						{rankLabel}
					</dt>
					<dd className="mt-1 font-mono text-lg font-bold tabular-nums">#{coin.market_cap_rank}</dd>
				</div>
			</dl>
		</section>
	)
}
