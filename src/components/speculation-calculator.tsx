'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useAtom } from 'jotai'
import { Calculator, Coins, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { CRYPTO_IDS, FIAT_CURRENCY_CONFIG, type FiatCurrency } from '@/lib/constants'
import { primaryFiatAtom } from '@/lib/currency-atoms'
import { type ExchangeRates, formatLargeNumber, formatSmartFiatPrice, getFiatRate } from '@/lib/currency-helpers'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

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
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5 text-primary" />
						{t('title')}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">{t('errorLoading')}</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calculator className="h-5 w-5 text-primary" />
					{t('title')}
				</CardTitle>
				<CardDescription>{t('description')}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6 px-4 pb-4">
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
						<p className="text-xs text-muted-foreground">
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
											<Image
												src={crypto.image || '/placeholder.svg'}
												alt={crypto.name}
												width={20}
												height={20}
												className="w-5 h-5 rounded-full"
												unoptimized
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
											'px-2 py-1 rounded text-xs font-medium transition-colors',
											customMarketCap === billions * 1_000_000_000
												? 'bg-primary text-primary-foreground'
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

				{/* Results Display */}
				{targetMarketCap > 0 && (
					<div className="p-6 rounded-xl border-2 border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
						<div className="flex items-center gap-3 mb-6">
							{!useCustomMarketCap && selectedCrypto && (
								<Image
									src={selectedCrypto.image || '/placeholder.svg'}
									alt={selectedCrypto.name}
									width={40}
									height={40}
									className="w-10 h-10 rounded-full"
									unoptimized
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

						<div className="grid gap-6 sm:grid-cols-3">
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground">{t('xnoPrice')}</p>
								<p className="font-mono font-bold text-2xl">
									{formatSmartFiatPrice(xnoPriceIf, selectedFiat)}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground">{t('yourStackValue')}</p>
								<p className="font-mono font-bold text-2xl text-primary">
									{futureValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground">{t('multiplier')}</p>
								<div className="flex items-center gap-2">
									<span
										className={cn(
											'font-mono font-bold text-2xl',
											multiplier >= 100
												? 'text-emerald-500'
												: multiplier >= 10
													? 'text-primary'
													: '',
										)}
									>
										{`${multiplier.toLocaleString(undefined, { maximumFractionDigits: 2 })}×`}
									</span>
								</div>
							</div>
						</div>

						{gain > 0 && (
							<div className="mt-4 pt-4 border-t border-primary/10">
								<p className="text-sm text-muted-foreground">{t('potentialGain')}</p>
								<p className="font-mono font-bold text-xl text-emerald-500">
									+{gain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
								</p>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
