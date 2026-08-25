'use client'

import { useId } from 'react'
import { useAtomValue } from 'jotai'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { FiatCurrency } from '@/lib/constants'
import { primaryFiatAtom } from '@/lib/currency-atoms'
import { formatFiatPrice, formatPercentage } from '@/lib/currency-helpers'
import type { FiatCurrencyCode } from '@/lib/types'

import { usePriceChart } from '@/hooks/use-price-chart'

import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from '@/components/theme-provider'

export function ArticleChartImpl({ days, fiat }: { days: '7' | '30' | '90'; fiat?: FiatCurrencyCode }) {
	const siteFiat = useAtomValue(primaryFiatAtom)
	const vsCurrency: FiatCurrencyCode = fiat ?? (siteFiat.toLowerCase() as FiatCurrencyCode)
	// FIAT_CURRENCY_CONFIG / formatFiatPrice are keyed by the uppercase enum values
	const fiatEnum = vsCurrency.toUpperCase() as FiatCurrency
	const gradientId = useId()
	const { resolvedTheme } = useTheme()
	const { prices, isLoading } = usePriceChart('nano', days, vsCurrency)

	if (isLoading || prices.length === 0) {
		return <Skeleton className="h-full w-full" />
	}

	const data = prices.map((point) => ({ t: point.timestamp, p: point.price }))
	const first = data[0].p
	const last = data[data.length - 1].p
	const change = first > 0 ? ((last - first) / first) * 100 : 0
	const gridStroke = resolvedTheme === 'dark' ? 'rgba(148,163,184,0.14)' : 'rgba(100,116,139,0.14)'
	const tooltipStyle = {
		background: 'var(--card)',
		border: '1px solid var(--border)',
		borderRadius: '6px',
		fontFamily: 'ui-monospace, monospace',
		fontSize: '12px',
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-baseline justify-between font-mono">
				<span className="text-[10px] uppercase tracking-widest text-muted-foreground">
					XNO / {vsCurrency.toUpperCase()} · {days}D
				</span>
				<span className="flex items-center gap-2">
					<span className="text-lg font-bold tabular-nums">{formatFiatPrice(last, fiatEnum)}</span>
					<span className={change >= 0 ? 'text-trendup' : 'text-trenddown'}>{formatPercentage(change)}</span>
				</span>
			</div>
			<div className="min-h-0 flex-1">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
						<defs>
							<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#209CE9" stopOpacity={0.35} />
								<stop offset="100%" stopColor="#209CE9" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid stroke={gridStroke} vertical={false} />
						<XAxis dataKey="t" hide type="number" domain={['dataMin', 'dataMax']} scale="time" />
						<YAxis hide domain={['auto', 'auto']} />
						<Tooltip
							contentStyle={tooltipStyle}
							labelFormatter={(label) => new Date(Number(label)).toLocaleDateString()}
							formatter={(value) => [formatFiatPrice(Number(value), fiatEnum), '']}
						/>
						<Area
							type="monotone"
							dataKey="p"
							stroke="#209CE9"
							strokeWidth={2}
							fill={`url(#${gradientId})`}
							dot={false}
							activeDot={{ r: 3 }}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}
