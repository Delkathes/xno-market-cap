'use client'

import { useTranslations } from 'next-intl'
import type { PieLabelRenderProps } from 'recharts'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { CRYPTO_COLORS, CRYPTO_IDS, CryptoTicker } from '@/lib/constants'

import { useIsClientSide } from '@/hooks/use-is-client-side'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { useMarketData } from '@/hooks/use-market-data'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

export function DominanceChart() {
	const t = useTranslations('dominance')

	const { data, isLoading, error, xnoData } = useMarketData()

	const isClientSide = useIsClientSide()
	const isMobile = useIsMobile()

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{t('chartTitle')}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-100 animate-pulse bg-muted rounded" />
				</CardContent>
			</Card>
		)
	}

	if (error || !data) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{t('chartTitle')}</CardTitle>
				</CardHeader>
				<CardContent>
					<MarketDataError error={error} />
				</CardContent>
			</Card>
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
		<Card>
			<CardHeader className="pb-0">
				<CardTitle>{t('distributionTitle')}</CardTitle>
				<CardDescription>{t('chartDescription', { xnoDominance })}</CardDescription>
			</CardHeader>
			<CardContent>
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
							<Tooltip
								formatter={(value: number | undefined) => [
									value && value >= 1e9
										? `${(value / 1e9).toFixed(2)}B XNO`
										: value
											? `${(value / 1e6).toFixed(2)}M XNO`
											: '0.00',
									t('marketCap'),
								]}
							/>
							<Legend />
						</PieChart>
					)}
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
