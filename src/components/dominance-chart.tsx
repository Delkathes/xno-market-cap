'use client'

import { useTranslations } from 'next-intl'
import type { PieLabelRenderProps } from 'recharts'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { CRYPTO_COLORS, CRYPTO_IDS, CryptoTicker } from '@/lib/constants'
import { formatLargeNumber } from '@/lib/currency-helpers'

import { useIsClientSide } from '@/hooks/use-is-client-side'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { useMarketData } from '@/hooks/use-market-data'

import { MarketDataError } from '@/components/market-data-error'

const SLICE_COLORS: Record<string, string> = {
	XNO: CRYPTO_COLORS.XNO,
	BTC: CRYPTO_COLORS.BTC,
	ETH: CRYPTO_COLORS.ETH,
	XRP: CRYPTO_COLORS.XRP,
	BNB: CRYPTO_COLORS.BNB,
	SOL: CRYPTO_COLORS.SOL,
	Others: CRYPTO_COLORS.OTHERS,
}

interface CustomTooltipProps {
	active?: boolean
	payload?: { value: number; name: string; fill: string }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
	if (!active || !payload?.length) return null

	return (
		<div className="rounded-md border border-border bg-popover p-3 font-mono shadow-lg">
			{payload.map((entry) => (
				<p key={entry.name} className="flex items-center gap-2 text-sm font-semibold tabular-nums">
					<span
						aria-hidden="true"
						className="inline-block h-2 w-2 rounded-full"
						style={{ backgroundColor: entry.fill }}
					/>
					{entry.name}
					<span className="text-muted-foreground">{formatLargeNumber(entry.value, { unit: 'XNO' })}</span>
				</p>
			))}
		</div>
	)
}

export function DominanceChart() {
	const t = useTranslations('dominance')

	const { data, error, xnoData } = useMarketData()

	const isClientSide = useIsClientSide()
	const isMobile = useIsMobile()

	if (error || !data) {
		return (
			<div className="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
				<MarketDataError error={error} compact />
			</div>
		)
	}

	const xnoPrice = xnoData?.current_price || 1
	const totalMarketCapXNO = data.reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0)

	// Get top 5 by market cap (excluding XNO)
	const top5 = [...data]
		.filter((c) => c.id !== CRYPTO_IDS.NANO)
		.sort((a, b) => b.market_cap - a.market_cap)
		.slice(0, 5)

	const xnoMarketCapXNO = xnoData ? xnoData.market_cap / xnoPrice : 0

	// Calculate "Others" - everything except XNO and top 5
	const top5Ids = new Set(top5.map((c) => c.id))
	const othersValue = data
		.filter((c) => c.id !== CRYPTO_IDS.NANO && !top5Ids.has(c.id))
		.reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0)

	const chartData = [
		{
			name: CryptoTicker.XNO,
			value: xnoMarketCapXNO,
			percentage: ((xnoMarketCapXNO / totalMarketCapXNO) * 100).toFixed(4),
		},
		...top5.map((crypto) => {
			const marketCapXNO = crypto.market_cap / xnoPrice
			return {
				name: crypto.symbol.toUpperCase(),
				value: marketCapXNO,
				percentage: ((marketCapXNO / totalMarketCapXNO) * 100).toFixed(2),
			}
		}),
		{
			name: 'Others',
			value: othersValue,
			percentage: ((othersValue / totalMarketCapXNO) * 100).toFixed(2),
		},
	]

	const xnoDominance = ((xnoMarketCapXNO / totalMarketCapXNO) * 100).toFixed(4)

	return (
		<div className="rounded-md border bg-card p-4 sm:p-5">
			<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t('chartTitle')}</p>
			<h2 className="mt-1 text-lg font-bold tracking-tight">{t('distributionTitle')}</h2>
			<p className="mt-1 font-mono text-xs text-muted-foreground">{t('chartDescription', { xnoDominance })}</p>
			<div className="mt-4">
				<ResponsiveContainer width="100%" height={400}>
					{isClientSide && (
						<PieChart>
							<Pie
								data={chartData}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={(props: PieLabelRenderProps) => {
									const { x, y, textAnchor, payload, percent, index } = props

									if (x === undefined || y === undefined || !payload) {
										return null
									}

									const name = String(payload.name ?? '')

									// Hide percentage for slices at index 3, 4, 5 (top 3-5 cryptos) to avoid overlap
									// Index: 0=XNO, 1=BTC, 2=ETH, 3=XRP, 4=BNB, 5=SOL, 6=Others
									const hidePercentage = index !== undefined && index >= 3 && index <= 5

									const percentage =
										typeof payload.percentage === 'string'
											? payload.percentage
											: percent !== undefined
												? (percent * 100).toFixed(2)
												: '0.00'

									return (
										<text
											x={x}
											y={y}
											fill="var(--foreground)"
											textAnchor={textAnchor ?? 'middle'}
											dominantBaseline="central"
											className="text-xs font-medium"
										>
											{hidePercentage ? name : `${name} ${percentage}%`}
										</text>
									)
								}}
								outerRadius={isMobile ? 100 : 120}
								fill="#8884d8"
								dataKey="value"
							>
								{chartData.map((entry) => (
									<Cell
										key={`cell-${entry.name}`}
										fill={SLICE_COLORS[entry.name] ?? 'hsl(var(--chart-1))'}
									/>
								))}
							</Pie>
							<Tooltip content={<CustomTooltip />} />
							<Legend wrapperStyle={{ fontSize: 12, fontFamily: 'var(--font-geist-mono)' }} />
						</PieChart>
					)}
				</ResponsiveContainer>
			</div>
		</div>
	)
}
