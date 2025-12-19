'use client'

import Image from 'next/image'
import { memo, useCallback, useMemo, useState } from 'react'
import { ArrowUpDown, Check, Copy, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { CryptoTicker } from '@/lib/constants'
import type { NanswapCurrency } from '@/lib/nanswap-types'

import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
	useCreateNanswapOrder,
	useNanswapCurrencies,
	useNanswapEstimate,
	useNanswapLimits,
	useNanswapOrder,
} from '@/hooks/use-nanswap'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

type SwapStep = 'input' | 'confirm' | 'processing' | 'complete'

const CurrencySelectItem = memo(function CurrencySelectItem({
	currencyKey,
	currency,
	feelessLabel,
}: {
	currencyKey: string
	currency: NanswapCurrency
	feelessLabel: string
}) {
	return (
		<SelectItem value={currencyKey}>
			<div className="flex items-center gap-2">
				<Image
					src={currency.image || '/placeholder.svg'}
					alt={currency.name}
					width={20}
					height={20}
					className="rounded-full"
				/>
				<span>{currencyKey}</span>
				{currency.feeless && (
					<Badge variant="secondary" className="text-xs ml-1">
						{feelessLabel}
					</Badge>
				)}
			</div>
		</SelectItem>
	)
})

function WidgetSkeleton() {
	return (
		<Card className="max-w-md mx-auto">
			<CardContent className="p-6 space-y-4">
				<div className="flex items-center justify-between mb-6">
					<Skeleton className="h-5 w-24" />
				</div>

				{/* From currency skeleton */}
				<div className="p-3 rounded-lg border bg-muted/50">
					<div className="flex items-center gap-2">
						<Skeleton className="h-10 w-35" />
						<Skeleton className="h-10 flex-1" />
					</div>
				</div>
				<Skeleton className="h-4 w-48" />

				{/* Swap button skeleton */}
				<div className="flex justify-center">
					<Skeleton className="h-10 w-10 rounded-full" />
				</div>

				{/* To currency skeleton */}
				<div className="p-3 rounded-lg border bg-muted/50">
					<div className="flex items-center gap-2">
						<Skeleton className="h-10 w-35" />
						<Skeleton className="h-10 flex-1" />
					</div>
				</div>

				{/* Address input skeleton */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-10 w-full" />
				</div>

				{/* Button skeleton */}
				<Skeleton className="h-12 w-full" />

				<Skeleton className="h-4 w-40 mx-auto" />
			</CardContent>
		</Card>
	)
}

export function NanswapIframe() {
	return (
		<iframe
			title="nanswap-iframe"
			src="https://nanswap.com/iframe-swap/swap?defaultFrom=BTC&defaultFromAmount=100&defaultTo=XNO&mode=swap&theme=auto&invitationId=88225687661"
			width="500"
			style={{
				border: 'none',
				borderRadius: '32px',
				width: '100%',
				height: '500px',
				background: 'transparent',
			}}
		/>
	)
}

export function NanswapWidget() {
	const t = useTranslations('swapNano')

	const [fromCurrency, setFromCurrency] = useState(CryptoTicker.BTC)
	const [toCurrency, setToCurrency] = useState(CryptoTicker.XNO)
	const [fromAmount, setFromAmount] = useState('')
	const [toAddress, setToAddress] = useState('')
	const [extraId, setExtraId] = useState('')
	const [step, setStep] = useState<SwapStep>('input')
	const [copiedAddress, setCopiedAddress] = useState(false)

	const { data: currencies, isLoading: currenciesLoading } = useNanswapCurrencies()

	const fromAmountNum = Number.parseFloat(fromAmount) || 0

	const debouncedAmount = useDebouncedValue(fromAmountNum, 500)

	const {
		data: estimate,
		isLoading: estimateLoading,
		isFetching: estimateFetching,
		isPlaceholderData,
	} = useNanswapEstimate(fromCurrency, toCurrency, debouncedAmount, debouncedAmount > 0)

	const { data: limits, isLoading: limitsLoading } = useNanswapLimits(fromCurrency, toCurrency)

	const createOrderMutation = useCreateNanswapOrder()
	const orderId = createOrderMutation.data?.id || null

	const { data: orderStatus } = useNanswapOrder(
		step === 'processing' || step === 'complete' ? orderId : null,
		step === 'processing' ? 5000 : undefined,
	)

	// Update step based on order status
	// useEffect(() => {
	// 	if (orderStatus?.status === 'completed') {
	// 		setStep('complete')
	// 	}
	// }, [orderStatus?.status])

	const sortedCurrencies = useMemo(() => {
		if (!currencies) return []
		return Object.entries(currencies).sort(([keyA, a], [keyB, b]) => {
			if (keyA === 'XNO') return -1
			if (keyB === 'XNO') return 1
			if (a.feeless && !b.feeless) return -1
			if (!a.feeless && b.feeless) return 1
			return a.name.localeCompare(b.name)
		})
	}, [currencies])

	// const fromCurrencyData = currencies?.[fromCurrency]
	const toCurrencyData = currencies?.[toCurrency]

	const isAmountValid = limits
		? fromAmountNum >= limits.min && (limits.max === null || fromAmountNum <= limits.max)
		: true
	const isAddressValid = toAddress.length > 0
	const canSwap = fromAmountNum > 0 && isAmountValid && isAddressValid && !estimateLoading

	const handleSwapCurrencies = useCallback(() => {
		const temp = fromCurrency
		setFromCurrency(toCurrency)
		setToCurrency(temp)
		setFromAmount('')
	}, [fromCurrency, toCurrency])

	const handleCreateOrder = useCallback(async () => {
		if (!canSwap) return

		try {
			await createOrderMutation.mutateAsync({
				from: fromCurrency,
				to: toCurrency,
				amount: fromAmountNum,
				toAddress,
				extraId: extraId || undefined,
			})
			setStep('processing')
		} catch (error) {
			console.error('Failed to create order:', error)
		}
	}, [canSwap, createOrderMutation, fromCurrency, toCurrency, fromAmountNum, toAddress, extraId])

	const handleCopyAddress = useCallback(async (address: string) => {
		await navigator.clipboard.writeText(address)
		setCopiedAddress(true)
		setTimeout(() => setCopiedAddress(false), 2000)
	}, [])

	const handleNewSwap = useCallback(() => {
		setStep('input')
		setFromAmount('')
		setToAddress('')
		setExtraId('')
		createOrderMutation.reset()
	}, [createOrderMutation])

	const renderCurrencySelect = useCallback(
		(value: string, onChange: (value: CryptoTicker) => void, _label: string) => (
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger className="w-35">
					<SelectValue>
						{currencies?.[value] && (
							<div className="flex items-center gap-2">
								<Image
									src={currencies[value].image || '/placeholder.svg'}
									alt={currencies[value].name}
									width={20}
									height={20}
									className="rounded-full"
								/>
								<span>{value}</span>
							</div>
						)}
					</SelectValue>
				</SelectTrigger>
				<SelectContent className="max-h-75">
					{sortedCurrencies.map(([key, currency]) => (
						<CurrencySelectItem
							key={key}
							currencyKey={key}
							currency={currency}
							feelessLabel={t('feeless')}
						/>
					))}
				</SelectContent>
			</Select>
		),
		[currencies, sortedCurrencies, t],
	)

	if (currenciesLoading) {
		return <WidgetSkeleton />
	}

	// Processing/Complete step
	if (step === 'processing' || step === 'complete') {
		const order = orderStatus || createOrderMutation.data

		return (
			<Card className="max-w-md mx-auto">
				<CardContent className="p-6 space-y-6">
					<div className="text-center">
						{step === 'complete' ? (
							<>
								<div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
									<Check className="w-8 h-8 text-green-500" />
								</div>
								<h3 className="text-xl font-bold mb-2">{t('swapComplete')}</h3>
								<p className="text-muted-foreground text-sm">
									{t('yourCurrencySent', { currency: toCurrency })}
								</p>
							</>
						) : (
							<>
								<Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
								<h3 className="text-xl font-bold mb-2">{t('processingSwap')}</h3>
								<p className="text-muted-foreground text-sm">
									{t('sendCurrencyToAddress', { currency: fromCurrency })}
								</p>
							</>
						)}
					</div>

					{order && (
						<div className="space-y-4">
							<div className="p-4 rounded-lg bg-muted/50 space-y-3">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">{t('status')}</span>
									<Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
										{order.status || t('waiting')}
									</Badge>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">{t('youSend')}</span>
									<span className="font-mono">
										{order.expectedAmountFrom} {fromCurrency}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">{t('youReceive')}</span>
									<span className="font-mono">
										~{order.expectedAmountTo} {toCurrency}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">{t('orderId')}</span>
									<span className="font-mono text-xs">{order.id}</span>
								</div>
							</div>

							{step === 'processing' && order.payinAddress && (
								<div className="space-y-2">
									<Label>{t('sendToAddress', { currency: fromCurrency })}</Label>
									<div className="flex items-center gap-2">
										<Input value={order.payinAddress} readOnly className="font-mono text-xs" />
										<Button
											variant="outline"
											size="icon"
											onClick={() => handleCopyAddress(order.payinAddress)}
										>
											{copiedAddress ? (
												<Check className="w-4 h-4 text-green-500" />
											) : (
												<Copy className="w-4 h-4" />
											)}
										</Button>
									</div>
								</div>
							)}

							{order.payinHash && (
								<div className="text-xs text-muted-foreground">
									<span>{t('paymentTx')} </span>
									<code className="break-all">{order.payinHash}</code>
								</div>
							)}

							{order.payoutHash && (
								<div className="text-xs text-muted-foreground">
									<span>{t('payoutTx')} </span>
									<code className="break-all">{order.payoutHash}</code>
								</div>
							)}
						</div>
					)}

					<Button className="w-full" onClick={handleNewSwap}>
						{t('newSwap')}
					</Button>
				</CardContent>
			</Card>
		)
	}

	// Input step
	return (
		<Card className="max-w-md mx-auto">
			<CardContent className="p-6">
				<div className="flex items-center justify-between mb-6">
					<span className="font-medium">{t('swapCoins')}</span>
					<div
						className={`transition-opacity duration-200 ${estimateFetching || isPlaceholderData ? 'opacity-100' : 'opacity-0'}`}
					>
						<Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
					</div>
				</div>

				{/* From Currency */}
				<div className="space-y-3 mb-2">
					<div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
						{renderCurrencySelect(fromCurrency, setFromCurrency, 'From')}
						<Input
							type="number"
							placeholder="0"
							value={fromAmount}
							onChange={(e) => setFromAmount(e.target.value)}
							className="text-right border-0 bg-transparent text-lg font-mono focus-visible:ring-0"
							step="any"
						/>
					</div>

					{limitsLoading ? (
						<Skeleton className="h-4 w-48" />
					) : (
						limits && (
							<p className="text-xs text-muted-foreground px-1">
								{t('min')} {limits.min} {fromCurrency} · {t('max')}{' '}
								{limits.max !== null ? `${limits.max} ${fromCurrency}` : t('noLimit')}
							</p>
						)
					)}

					<div className="flex justify-center">
						<Button
							variant="outline"
							size="icon"
							className="rounded-full bg-transparent"
							onClick={handleSwapCurrencies}
						>
							<ArrowUpDown className="w-4 h-4" />
						</Button>
					</div>

					{/* To Currency */}
					<div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
						{renderCurrencySelect(toCurrency, setToCurrency, 'To')}
						<div className="flex-1 text-right">
							{estimateLoading && !estimate ? (
								<Skeleton className="h-7 w-32 ml-auto" />
							) : (
								<Input
									type="text"
									placeholder="0"
									value={estimate?.amountTo != null ? `~${estimate.amountTo.toFixed(6)}` : ''}
									className={`text-right border-0 bg-transparent text-lg font-mono focus-visible:ring-0 transition-opacity duration-200 ${isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}
									readOnly
								/>
							)}
						</div>
					</div>
				</div>

				<div className="h-5 mb-4">
					{estimate?.amountFrom != null &&
						estimate?.amountTo != null &&
						estimate.amountTo > 0 &&
						debouncedAmount > 0 && (
							<p
								className={`text-xs text-muted-foreground text-right transition-opacity duration-200 ${isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}
							>
								1 {toCurrency} ≈ {(estimate.amountFrom / estimate.amountTo).toFixed(8)} {fromCurrency}
							</p>
						)}
				</div>

				{/* Validation errors */}
				{limits && fromAmountNum > 0 && !isAmountValid && (
					<Alert variant="destructive" className="mb-4">
						<AlertDescription>
							{fromAmountNum < limits.min
								? t('minAmountError', { min: limits.min, currency: fromCurrency })
								: limits.max !== null
									? t('maxAmountError', { max: limits.max, currency: fromCurrency })
									: t('minAmountError', { min: limits.min, currency: fromCurrency })}
						</AlertDescription>
					</Alert>
				)}

				{/* Destination Address */}
				<div className="space-y-2 mb-4">
					<div className="flex items-center justify-between">
						<Label>{t('destinationAddress')}</Label>
					</div>
					<Input
						placeholder={t('yourAddressPlaceholder', { currency: toCurrency })}
						value={toAddress}
						onChange={(e) => setToAddress(e.target.value)}
					/>
				</div>

				{/* Extra ID (Memo) - only show for certain currencies */}
				{toCurrencyData && !toCurrencyData.feeless && (
					<div className="space-y-2 mb-4">
						<Label>{t('memoExtraId')}</Label>
						<Input
							placeholder={t('optional')}
							value={extraId}
							onChange={(e) => setExtraId(e.target.value)}
						/>
					</div>
				)}

				{createOrderMutation.error && (
					<Alert variant="destructive" className="mb-4">
						<AlertDescription>{createOrderMutation.error.message}</AlertDescription>
					</Alert>
				)}

				<Button
					className="w-full"
					size="lg"
					disabled={!canSwap || createOrderMutation.isPending}
					onClick={handleCreateOrder}
				>
					{createOrderMutation.isPending ? (
						<>
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							{t('creatingOrder')}
						</>
					) : (
						t('swap')
					)}
				</Button>

				<p className="text-center text-xs text-muted-foreground mt-4">
					{t('poweredBy')}{' '}
					<a
						href="https://nanswap.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline"
					>
						Nanswap.com
					</a>
				</p>
			</CardContent>
		</Card>
	)
}
