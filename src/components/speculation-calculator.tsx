'use client'

import { useMemo, useState } from 'react'
import { useAtom } from 'jotai'
import { Coins } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { CRYPTO_IDS, FIAT_CURRENCY_CONFIG, type FiatCurrency } from '@/lib/constants'
import { primaryFiatAtom } from '@/lib/currency-atoms'
import { type ExchangeRates, formatLargeNumber, formatSmartFiatPrice, getFiatRate } from '@/lib/currency-helpers'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CoinIcon } from '@/components/coin-icon'

export function SpeculationCalculator() {
	const t = useTranslations('speculationCalculator')

	const { data, xnoData, xnoCirculatingSupply, eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate, error } =
		useMarketData()

	const [primaryFiat] = useAtom(primaryFiatAtom)
	const [selectedFiat, setSelectedFiat] = useState<FiatCurrency>(primaryFiat)
	const [xnoAmount, setXnoAmount] = useState<number>(1000)
	const [selectedCryptoId, setSelectedCryptoId] = useState<string>('bitcoin')
	const [useCustomMarketCap, setUseCustomMarketCap] = useState<boolean>(false)
	const [customMarketCap, setCustomMarketCap] = useState<number>(100_000_000_000)

	const rates: ExchangeRates = { eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate }
	const rate = getFiatRate(selectedFiat, rates)
	const fiatConfig = FIAT_CURRENCY_CONFIG[selectedFiat]

	const currentXnoPrice = useMemo(() => {
		if (!xnoData?.current_price) return 0
		return xnoData.current_price * rate
	}, [xnoData, rate])

	const currentValue = useMemo(() => xnoAmount * currentXnoPrice, [xnoAmount, currentXnoPrice])

	const topCryptos = useMemo(() => {
		if (!data) return []
		return data
			.filter((c) => c.id !== CRYPTO_IDS.NANO)
			.sort((a, b) => b.market_cap - a.market_cap)
			.slice(0, 25)
	}, [data])

	const selectedCrypto = useMemo(() => {
		return topCryptos.find((c) => c.id === selectedCryptoId)
	}, [topCryptos, selectedCryptoId])

	// Calculate results based on selected market cap source
	const targetMarketCap = useMemo(() => {
		if (useCustomMarketCap) return customMarketCap
		if (selectedCrypto) return selectedCrypto.market_cap * rate
		return 0
	}, [useCustomMarketCap, customMarketCap, selectedCrypto, rate])

	const xnoPriceIf = useMemo(() => {
		if (targetMarketCap <= 0 || xnoCirculatingSupply <= 0) return 0
		return targetMarketCap / xnoCirculatingSupply
	}, [targetMarketCap, xnoCirculatingSupply])

	const multiplier = useMemo(() => {
		if (currentXnoPrice <= 0) return 0
		return xnoPriceIf / currentXnoPrice
	}, [xnoPriceIf, currentXnoPrice])

	const futureValue = useMemo(() => xnoAmount * xnoPriceIf, [xnoAmount, xnoPriceIf])
	const gain = useMemo(() => futureValue - currentValue, [futureValue, currentValue])

	if (error || !data) {
		return (
			<div className="rounded-lg border p-6 text-center text-muted-foreground text-sm">{t('errorLoading')}</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* ============ INPUT BANK ============ */}
			<section className="space-y-6 rounded-lg border bg-muted/20 p-4 sm:p-5">
				{/* Input Section */}
				<div className="grid gap-4 sm:grid-cols-3">
					{/* XNO Amount Input */}
					<div className="space-y-2">
						<Label htmlFor="xno-amount" className="flex items-center gap-2">
							<Coins className="h-4 w-4 text-muted-foreground" />
							{t('yourStack')}
						</Label>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
								Ӿ
							</span>
							<Input
								id="xno-amount"
								type="number"
								min={0}
								step={100}
								value={xnoAmount}
								onChange={(e) => setXnoAmount(Number.parseFloat(e.target.value) || 0)}
								className="pl-8 font-mono w-fit"
							/>
						</div>
						<p suppressHydrationWarning className="text-xs text-muted-foreground">
							{t('currentValue')}: {fiatConfig.symbol}
							{currentValue.toLocaleString()}
						</p>
					</div>

					{/* Currency Selector */}
					<div className="space-y-2">
						<Label htmlFor="fiat-select">{t('currency')}</Label>
						<Select value={selectedFiat} onValueChange={(v) => setSelectedFiat(v as FiatCurrency)}>
							<SelectTrigger id="fiat-select" className="w-fit">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(FIAT_CURRENCY_CONFIG).map(([key, config]) => (
									<SelectItem key={key} value={key}>
										<span className="font-mono mr-2">{config.symbol}</span>
										{config.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>{t('compareWith')}</Label>
						<Select
							value={selectedCryptoId}
							onValueChange={setSelectedCryptoId}
							disabled={useCustomMarketCap}
						>
							<SelectTrigger className={cn(useCustomMarketCap && 'opacity-50')}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{topCryptos.map((crypto) => (
									<SelectItem key={crypto.id} value={crypto.id}>
										<div className="flex items-center gap-2">
											<CoinIcon
												id={crypto.id}
												image={crypto.image}
												alt={crypto.name}
												width={20}
												height={20}
												className="w-5 h-5 rounded-full"
											/>
											<span>{crypto.name}</span>
											<span className="text-muted-foreground text-xs ml-auto">
												{fiatConfig.symbol}
												{formatLargeNumber(crypto.market_cap * rate)}
											</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Market Cap Source Selection */}
				<div className="space-y-4">
					{/* Custom Market Cap Toggle */}
					<div className="flex items-center gap-3">
						<Switch
							id="custom-mc-toggle"
							checked={useCustomMarketCap}
							onCheckedChange={setUseCustomMarketCap}
						/>
						<Label htmlFor="custom-mc-toggle" className="text-sm font-medium cursor-pointer">
							{t('useCustomMarketCap')}
						</Label>
					</div>

					{useCustomMarketCap && (
						<div className="space-y-2">
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
									{fiatConfig.symbol}
								</span>
								<Input
									type="number"
									min={0}
									step={1000000000}
									value={customMarketCap || ''}
									onChange={(e) => setCustomMarketCap(Number.parseFloat(e.target.value) || 0)}
									placeholder="e.g. 100000000000"
									className="pl-8 font-mono w-full sm:w-64"
								/>
							</div>
							{/* Quick Presets */}
							<div className="flex flex-wrap gap-1.5">
								{[1, 10, 50, 100, 500, 1000].map((billions) => (
									<button
										key={billions}
										type="button"
										onClick={() => setCustomMarketCap(billions * 1_000_000_000)}
										className={cn(
											'px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer active:scale-95',
											customMarketCap === billions * 1_000_000_000
												? 'bg-primary text-primary-foreground shadow-sm'
												: 'bg-muted hover:bg-muted/80 text-muted-foreground',
										)}
									>
										{fiatConfig.symbol}
										{billions}B
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			</section>

			{/* ============ RESULT READOUT ============ */}
			{targetMarketCap > 0 && (
				<section className="rounded-lg border border-primary/25 bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-5 sm:p-6">
					{/* Target header */}
					<div className="flex items-center gap-3 mb-6">
						{!useCustomMarketCap && selectedCrypto && (
							<CoinIcon
								id={selectedCrypto.id}
								image={selectedCrypto.image}
								alt={selectedCrypto.name}
								width={40}
								height={40}
								className="w-10 h-10 rounded-full ring-1 ring-border"
							/>
						)}
						<div>
							<p className="text-sm text-muted-foreground">{t('ifXnoHadMarketCapOf')}</p>
							<p className="font-semibold text-lg">
								{useCustomMarketCap
									? `${fiatConfig.symbol}${formatLargeNumber(customMarketCap)}`
									: `${selectedCrypto?.name} (${fiatConfig.symbol}${formatLargeNumber(targetMarketCap)})`}
							</p>
						</div>
					</div>

					{/* Hero multiplier */}
					<div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
						<div className="min-w-0">
							<p className="text-sm text-muted-foreground mb-1">{t('multiplier')}</p>
							<p
								suppressHydrationWarning
								className={cn(
									'font-bold text-4xl sm:text-6xl tabular-nums tracking-tighter leading-none break-all',
									multiplier >= 100
										? 'text-emerald-500'
										: multiplier >= 10
											? 'text-primary'
											: 'text-foreground',
								)}
							>
								{`${multiplier.toLocaleString(undefined, { maximumFractionDigits: 2 })}×`}
							</p>
						</div>
						{gain > 0 && (
							<div className="min-w-0 text-left sm:text-right">
								<p className="text-sm text-muted-foreground mb-1">{t('potentialGain')}</p>
								<p
									suppressHydrationWarning
									className="font-mono font-bold text-xl sm:text-2xl text-emerald-500 tabular-nums break-all"
								>
									+{gain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
								</p>
							</div>
						)}
					</div>

					{/* Readout tiles */}
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-lg border bg-muted/30 p-4 shadow-[inset_0_1px_0_hsl(var(--border)/0.5)]">
							<p className="text-sm text-muted-foreground mb-1">{t('xnoPrice')}</p>
							<p suppressHydrationWarning className="font-mono font-bold text-2xl tabular-nums break-all">
								{formatSmartFiatPrice(xnoPriceIf, selectedFiat)}
							</p>
						</div>
						<div className="rounded-lg border bg-muted/30 p-4 shadow-[inset_0_1px_0_hsl(var(--border)/0.5)]">
							<p className="text-sm text-muted-foreground mb-1">{t('yourStackValue')}</p>
							<p
								suppressHydrationWarning
								className="font-mono font-bold text-2xl text-primary tabular-nums break-all"
							>
								{futureValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
							</p>
						</div>
					</div>
				</section>
			)}
		</div>
	)
}
