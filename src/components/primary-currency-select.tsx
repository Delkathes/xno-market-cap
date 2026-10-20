'use client'

import { useAtom } from 'jotai'
import { useTranslations } from 'next-intl'

import { FIAT_CURRENCY_CONFIG, type FiatCurrency } from '@/lib/constants'
import { primaryFiatAtom } from '@/lib/currency-atoms'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

/**
 * Compact single-select for the primary fiat currency. Shares the
 * primaryFiatAtom with the market overview currency settings, so changing it
 * here reflows every currency-sensitive widget on the page.
 */
export function PrimaryCurrencySelect() {
	const [primaryFiat, setPrimaryFiat] = useAtom(primaryFiatAtom)
	const t = useTranslations('currencySettings')

	return (
		<Select value={primaryFiat} onValueChange={(value) => setPrimaryFiat(value as FiatCurrency)}>
			<SelectTrigger
				size="sm"
				aria-label={t('primaryFiat')}
				className="border-dashed border-border bg-muted/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground data-[size=sm]:h-auto [&_svg]:size-3"
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent align="start">
				{Object.entries(FIAT_CURRENCY_CONFIG).map(([key, { symbol }]) => (
					<SelectItem key={key} value={key}>
						<span className="font-mono text-xs">
							{symbol} {key}
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
