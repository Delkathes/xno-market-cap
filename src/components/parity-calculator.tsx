'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { Calculator, Coins, Lock, Pencil, Percent, PiggyBank, Unlock, Users, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ASSET_CONFIG } from '@/lib/asset-config'
import { FIAT_CURRENCY_CONFIG, FiatCurrency } from '@/lib/constants'
import { primaryFiatAtom } from '@/lib/currency-atoms'
import { formatFiatPrice, formatPercentage, formatXNOAmount } from '@/lib/currency-helpers'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { HolderTierDialog, type TierKey } from '@/components/holder-tier-dialog'

// =============================================================================
// CONSTANTS & TYPES
// =============================================================================

const XNO_TOTAL_SUPPLY = 133_248_297

// Fields that can be locked
type LockableField = 'price' | 'amount' | 'people' | 'totalInvestment' | 'totalXNO'

// Thresholds for visual feedback on supply percentage
const SUPPLY_THRESHOLDS = {
	tiny: 0.0001,
	small: 0.001,
	notable: 0.01,
	significant: 0.1,
	major: 1,
	whale: 10,
} as const

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getSupplyTierInfo = (percentage: number): { tierKey: TierKey; color: string; emoji: string } => {
	if (percentage >= SUPPLY_THRESHOLDS.whale)
		return { tierKey: 'tierLegendaryWhale', color: 'text-purple-500', emoji: '🐋' }
	if (percentage >= SUPPLY_THRESHOLDS.major)
		return { tierKey: 'tierMajorHolder', color: 'text-blue-500', emoji: '🦈' }
	if (percentage >= SUPPLY_THRESHOLDS.significant)
		return { tierKey: 'tierSignificantStack', color: 'text-cyan-500', emoji: '🐬' }
	if (percentage >= SUPPLY_THRESHOLDS.notable)
		return { tierKey: 'tierNotableHolder', color: 'text-emerald-500', emoji: '🐠' }
	if (percentage >= SUPPLY_THRESHOLDS.small)
		return { tierKey: 'tierGrowingStack', color: 'text-green-500', emoji: '🐟' }
	if (percentage >= SUPPLY_THRESHOLDS.tiny)
		return { tierKey: 'tierStartingOut', color: 'text-yellow-500', emoji: '🦐' }
	return { tierKey: 'tierPlankton', color: 'text-muted-foreground', emoji: '🦠' }
}

// Lock toggle button component
interface LockButtonProps {
	isLocked: boolean
	onToggle: () => void
	disabled?: boolean
	className?: string
}

function LockButton({ isLocked, onToggle, disabled, className }: LockButtonProps) {
	const t = useTranslations('parityCalculator')
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onClick={onToggle}
			disabled={disabled}
			className={cn(
				'h-6 w-6 shrink-0 cursor-pointer',
				isLocked ? 'text-amber-500' : 'text-muted-foreground/50',
				className,
			)}
			title={isLocked ? t('clickToUnlock') : t('clickToLock')}
		>
			{isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
		</Button>
	)
}

// Editable stat card with popover
interface EditableStatCardProps {
	icon: React.ReactNode
	label: string
	value: string
	numericValue: number
	onValueChange: (value: number) => void
	isLocked: boolean
	onLockToggle: () => void
	canLock: boolean
	inputPrefix?: string
	inputSuffix?: string
	highlight?: boolean
	subValue?: string
	min?: number
	max?: number
	step?: number
}

function EditableStatCard({
	icon,
	label,
	value,
	numericValue,
	onValueChange,
	isLocked,
	onLockToggle,
	canLock,
	inputPrefix,
	inputSuffix,
	highlight,
	subValue,
	min = 0,
	max,
	step = 0.01,
}: EditableStatCardProps) {
	const t = useTranslations('parityCalculator')
	const [isOpen, setIsOpen] = useState(false)
	const [inputValue, setInputValue] = useState('')
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (isOpen) {
			setInputValue(numericValue.toString())
			setTimeout(() => inputRef.current?.select(), 0)
		}
	}, [isOpen, numericValue])

	const handleConfirm = useCallback(() => {
		const parsed = Number.parseFloat(inputValue)
		if (!Number.isNaN(parsed) && parsed >= min && (max === undefined || parsed <= max)) {
			onValueChange(parsed)
		}
		setIsOpen(false)
	}, [inputValue, min, max, onValueChange])

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter') handleConfirm()
			if (e.key === 'Escape') setIsOpen(false)
		},
		[handleConfirm],
	)

	return (
		<div
			className={cn(
				'p-4 rounded-lg border bg-card space-y-1 relative group',
				highlight && 'bg-[#209CE9]/10 border-[#209CE9]/30',
				isLocked && 'ring-1 ring-amber-500/30',
			)}
		>
			{/* Lock button - top right */}
			<div className="absolute top-2 right-2">
				<LockButton isLocked={isLocked} onToggle={onLockToggle} disabled={!canLock && !isLocked} />
			</div>

			<div className="flex items-center gap-2 text-sm text-muted-foreground pr-6">
				{icon}
				{label}
			</div>

			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						className={cn(
							'text-2xl font-bold font-mono text-left flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer w-fit',
							highlight && 'text-[#209CE9]',
						)}
					>
						{value}
						<Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity ml-1" />
					</button>
				</PopoverTrigger>
				<PopoverContent className="w-56 p-3" align="start">
					<div className="space-y-2">
						<label htmlFor={`edit-${label}`} className="text-sm font-medium">
							{label}
						</label>
						<div className="relative">
							{inputPrefix && (
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
									{inputPrefix}
								</span>
							)}
							<Input
								ref={inputRef}
								id={`edit-${label}`}
								type="number"
								min={min}
								max={max}
								step={step}
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								onKeyDown={handleKeyDown}
								className={cn('font-mono', inputPrefix && 'pl-7', inputSuffix && 'pr-7')}
							/>
							{inputSuffix && (
								<span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
									{inputSuffix}
								</span>
							)}
						</div>
						<p className="text-xs text-muted-foreground">{t('pressEnterToConfirm')}</p>
					</div>
				</PopoverContent>
			</Popover>

			{subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
		</div>
	)
}

// People count popover input for precise control
interface PeoplePopoverInputProps {
	value: number
	onChange: (value: number) => void
	t: (key: string) => string
}

function PeoplePopoverInput({ value, onChange, t }: PeoplePopoverInputProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [inputValue, setInputValue] = useState('')
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (isOpen) {
			setInputValue(value.toString())
			setTimeout(() => inputRef.current?.select(), 0)
		}
	}, [isOpen, value])

	const handleConfirm = useCallback(() => {
		const parsed = Number.parseInt(inputValue, 10)
		if (!Number.isNaN(parsed) && parsed >= 1) {
			onChange(Math.min(parsed, 10_000_000_000)) // Max 10 billion
		}
		setIsOpen(false)
	}, [inputValue, onChange])

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter') handleConfirm()
			if (e.key === 'Escape') setIsOpen(false)
		},
		[handleConfirm],
	)

	const formatPeopleDisplay = (n: number): string => {
		if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
		if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
		if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
		return n.toLocaleString()
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group cursor-pointer"
				>
					{formatPeopleDisplay(value)} {value === 1 ? t('person') : t('people')}
					<Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-48 p-3" align="end">
				<div className="space-y-2">
					<label htmlFor="people-input" className="text-sm font-medium">
						{t('numberOfPeople')}
					</label>
					<Input
						ref={inputRef}
						id="people-input"
						type="number"
						min={1}
						step={1}
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						className="font-mono"
					/>
					<p className="text-xs text-muted-foreground">{t('pressEnterToConfirm')}</p>
				</div>
			</PopoverContent>
		</Popover>
	)
}

const INITIAL_AMOUNT = 1000 as const

export function ParityCalculator() {
	const t = useTranslations('parityCalculator')

	const { xnoData, eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate } = useMarketData()

	const [primaryFiat] = useAtom(primaryFiatAtom)

	// Core values (the "source of truth")
	const [price, setPrice] = useState<number>(0)
	const [amount, setAmount] = useState<number>(INITIAL_AMOUNT)
	const [people, setPeople] = useState<number>(1)
	const [totalInvestment, setTotalInvestment] = useState<number>(INITIAL_AMOUNT)
	const [totalXNO, setTotalXNO] = useState<number>(0)

	const [selectedFiat, setSelectedFiat] = useState<FiatCurrency>(primaryFiat)

	// Lock states - which fields are locked (at most 2 can be locked for the system to be solvable)
	const [lockedFields, setLockedFields] = useState<Set<LockableField>>(new Set(['price']))

	// Get conversion rate for selected fiat
	const getFiatRate = useCallback(
		(fiat: FiatCurrency): number => {
			switch (fiat) {
				case FiatCurrency.USD:
					return 1
				case FiatCurrency.EUR:
					return eurRate ?? 1
				case FiatCurrency.GBP:
					return gbpRate ?? 1
				case FiatCurrency.JPY:
					return jpyRate ?? 1
				case FiatCurrency.CHF:
					return chfRate ?? 1
				case FiatCurrency.CAD:
					return cadRate ?? 1
				case FiatCurrency.AUD:
					return audRate ?? 1
				default:
					return 1
			}
		},
		[eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate],
	)

	// Calculate XNO price in selected fiat
	const xnoPriceInFiat = useMemo(() => {
		if (!xnoData?.current_price) return 1
		const rate = getFiatRate(selectedFiat)
		return xnoData.current_price * rate
	}, [xnoData, selectedFiat, getFiatRate])

	// Initialize price with market price on first load
	const initializedRef = useRef(false)
	useEffect(() => {
		if (!initializedRef.current && xnoPriceInFiat > 0) {
			initializedRef.current = true
			setPrice(xnoPriceInFiat)
			// Calculate initial totalXNO based on defaults
			const initialTotalXNO = INITIAL_AMOUNT / xnoPriceInFiat
			setTotalXNO(initialTotalXNO)
		}
	}, [xnoPriceInFiat])

	// Supply percentage (derived from totalXNO)
	const supplyPercentage = useMemo(() => (totalXNO / XNO_TOTAL_SUPPLY) * 100, [totalXNO])

	// Theoretical supply percentage - what would be needed without clamping
	// This detects "impossible" scenarios where demand exceeds fixed supply
	const theoreticalSupplyPercentage = useMemo(() => {
		if (price <= 0) return 0
		const theoreticalXNO = totalInvestment / price
		return (theoreticalXNO / XNO_TOTAL_SUPPLY) * 100
	}, [totalInvestment, price])

	// Whether the current scenario is impossible (trying to buy more than exists)
	const isImpossibleScenario = theoreticalSupplyPercentage > 100

	// Per-person supply percentage (for holder tier calculation)
	const perPersonSupplyPercentage = useMemo(() => supplyPercentage / people, [supplyPercentage, people])

	// Holder tier (based on per-person share, not total)
	const tierInfo = useMemo(() => getSupplyTierInfo(perPersonSupplyPercentage), [perPersonSupplyPercentage])
	const tier = useMemo(
		() => ({
			label: t(tierInfo.tierKey),
			color: tierInfo.color,
			emoji: tierInfo.emoji,
		}),
		[t, tierInfo],
	)

	// Currency config
	const fiatConfig = FIAT_CURRENCY_CONFIG[selectedFiat]

	// Dynamic step for price input based on current price
	const priceStep = useMemo(() => {
		if (price >= 25) return 1
		if (price >= 10) return 0.5
		if (price >= 2) return 0.1
		if (price >= 1) return 0.01
		return 0.0001
	}, [price])

	// Toggle lock for a field
	const toggleLock = useCallback((field: LockableField) => {
		setLockedFields((prev) => {
			const next = new Set(prev)
			if (next.has(field)) {
				next.delete(field)
			} else {
				// Allow up to 2 locks (need at least one free variable to solve)
				if (next.size < 2) {
					next.add(field)
				}
			}
			return next
		})
	}, [])

	// Check if a field can be locked (max 2 locks)
	const canLock = useCallback(
		(field: LockableField) => {
			if (lockedFields.has(field)) return true
			return lockedFields.size < 2
		},
		[lockedFields],
	)

	// Solve the system when a value changes
	// Equations:
	// totalInvestment = amount * people
	// totalXNO = totalInvestment / price
	// supplyPercentage = (totalXNO / XNO_TOTAL_SUPPLY) * 100

	const solveSystem = useCallback(
		(changed: LockableField, newValue: number) => {
			const locked = lockedFields

			let newPrice = price
			let newAmount = amount
			let newPeople = people
			let newTotalInvestment = totalInvestment
			let newTotalXNO = totalXNO

			// Apply the changed value
			switch (changed) {
				case 'price':
					newPrice = newValue
					break
				case 'amount':
					newAmount = newValue
					break
				case 'people':
					newPeople = Math.max(1, Math.round(newValue))
					break
				case 'totalInvestment':
					newTotalInvestment = newValue
					break
				case 'totalXNO':
					newTotalXNO = newValue
					break
			}

			// Solver logic:
			// Equations: totalInvestment = amount * people, totalXNO = totalInvestment / price
			// We need to maintain both equations while respecting locks

			const priceLocked = locked.has('price')
			const amountLocked = locked.has('amount')
			const peopleLocked = locked.has('people')
			const totalInvestmentLocked = locked.has('totalInvestment')
			const totalXNOLocked = locked.has('totalXNO')

			// Helper: clamp values to valid ranges (also guards against NaN/Infinity)
			const clampPrice = (v: number) => (Number.isFinite(v) ? Math.max(0.00001, v) : price)
			const clampAmount = (v: number) => (Number.isFinite(v) ? Math.max(0.01, v) : amount)
			const clampPeople = (v: number) => (Number.isFinite(v) ? Math.max(1, Math.round(v)) : people)
			const clampTotalInvestment = (v: number) => (Number.isFinite(v) ? Math.max(0.01, v) : totalInvestment)
			const clampTotalXNO = (v: number) =>
				Number.isFinite(v) ? Math.max(0.000001, Math.min(v, XNO_TOTAL_SUPPLY)) : totalXNO

			if (changed === 'price') {
				newPrice = clampPrice(newPrice)
				if (totalXNOLocked || totalInvestmentLocked) {
					if (totalInvestmentLocked) {
						// totalInvestment fixed → totalXNO adjusts
						newTotalXNO = clampTotalXNO(newTotalInvestment / newPrice)
					} else {
						// totalXNO fixed → totalInvestment must change
						newTotalInvestment = clampTotalInvestment(newTotalXNO * newPrice)
						// Propagate to amount/people
						if (!amountLocked) {
							newAmount = clampAmount(newTotalInvestment / newPeople)
						} else if (!peopleLocked) {
							newPeople = clampPeople(newTotalInvestment / newAmount)
						}
					}
				} else {
					// totalXNO can change
					newTotalXNO = clampTotalXNO(newTotalInvestment / newPrice)
				}
			} else if (changed === 'amount') {
				newAmount = clampAmount(newAmount)
				if (totalInvestmentLocked) {
					// totalInvestment fixed → adjust people
					if (!peopleLocked) {
						newPeople = clampPeople(newTotalInvestment / newAmount)
					}
					// Then adjust totalXNO or price
					if (!totalXNOLocked) {
						newTotalXNO = clampTotalXNO(newTotalInvestment / newPrice)
					} else if (!priceLocked) {
						newPrice = clampPrice(newTotalInvestment / newTotalXNO)
					}
				} else if (totalXNOLocked && priceLocked) {
					// Both locked → totalInvestment is fixed → adjust people
					const fixedTotalInvestment = newTotalXNO * newPrice
					newTotalInvestment = clampTotalInvestment(fixedTotalInvestment)
					newPeople = clampPeople(fixedTotalInvestment / newAmount)
				} else if (totalXNOLocked) {
					// totalXNO fixed, price can adjust
					newTotalInvestment = clampTotalInvestment(newAmount * newPeople)
					newPrice = clampPrice(newTotalInvestment / newTotalXNO)
				} else {
					// Normal case: recalculate totalInvestment, then totalXNO
					newTotalInvestment = clampTotalInvestment(newAmount * newPeople)
					newTotalXNO = clampTotalXNO(newTotalInvestment / newPrice)
				}
			} else if (changed === 'people') {
				newPeople = clampPeople(newPeople)
				if (totalInvestmentLocked) {
					// totalInvestment fixed → adjust amount
					if (!amountLocked) {
						newAmount = clampAmount(newTotalInvestment / newPeople)
					}
					// Then adjust totalXNO or price
					if (!totalXNOLocked) {
						newTotalXNO = clampTotalXNO(newTotalInvestment / newPrice)
					} else if (!priceLocked) {
						newPrice = clampPrice(newTotalInvestment / newTotalXNO)
					}
				} else if (totalXNOLocked && priceLocked) {
					// Both locked → totalInvestment is fixed → adjust amount
					const fixedTotalInvestment = newTotalXNO * newPrice
					newTotalInvestment = clampTotalInvestment(fixedTotalInvestment)
					newAmount = clampAmount(fixedTotalInvestment / newPeople)
				} else if (totalXNOLocked) {
					// totalXNO fixed, price can adjust
					newTotalInvestment = clampTotalInvestment(newAmount * newPeople)
					newPrice = clampPrice(newTotalInvestment / newTotalXNO)
				} else {
					// Normal case
					newTotalInvestment = clampTotalInvestment(newAmount * newPeople)
					newTotalXNO = clampTotalXNO(newTotalInvestment / newPrice)
				}
			} else if (changed === 'totalInvestment') {
				newTotalInvestment = clampTotalInvestment(newTotalInvestment)
				// Propagate to amount or people
				if (!amountLocked) {
					newAmount = clampAmount(newTotalInvestment / newPeople)
				} else if (!peopleLocked) {
					newPeople = clampPeople(newTotalInvestment / newAmount)
				}
				// Then handle totalXNO/price
				if (totalXNOLocked && !priceLocked) {
					newPrice = clampPrice(newTotalInvestment / newTotalXNO)
				} else if (!totalXNOLocked) {
					newTotalXNO = clampTotalXNO(newTotalInvestment / newPrice)
				}
			} else if (changed === 'totalXNO') {
				newTotalXNO = clampTotalXNO(newTotalXNO)
				if (totalInvestmentLocked) {
					// totalInvestment fixed → price must adjust
					if (!priceLocked) {
						newPrice = clampPrice(newTotalInvestment / newTotalXNO)
					}
				} else if (priceLocked) {
					// Price fixed → totalInvestment must change
					newTotalInvestment = clampTotalInvestment(newTotalXNO * newPrice)
					// Propagate to amount/people
					if (!amountLocked) {
						newAmount = clampAmount(newTotalInvestment / newPeople)
					} else if (!peopleLocked) {
						newPeople = clampPeople(newTotalInvestment / newAmount)
					}
				} else {
					// Price can adjust
					newPrice = clampPrice(newTotalInvestment / newTotalXNO)
				}
			}

			// Apply all new values
			setPrice(newPrice)
			setAmount(newAmount)
			setPeople(newPeople)
			setTotalInvestment(newTotalInvestment)
			setTotalXNO(newTotalXNO)
		},
		[lockedFields, price, amount, people, totalInvestment, totalXNO],
	)

	// Handler for supply percentage change (converts to totalXNO)
	const handleSupplyPercentageChange = useCallback(
		(percentage: number) => {
			const xno = (percentage / 100) * XNO_TOTAL_SUPPLY
			solveSystem('totalXNO', xno)
		},
		[solveSystem],
	)

	return (
		<Card>
			<CardHeader className="pb-0">
				<div>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5 text-[#209CE9]" />
						{t('title')}
					</CardTitle>
					<CardDescription>{t('description')}</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="space-y-6 px-4">
				{/* Lock guide */}
				<div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
					<Lock className="h-3.5 w-3.5 text-amber-500" />
					<span>{t('lockGuide')}</span>
				</div>

				{/* Input fields with locks */}
				<div className="grid gap-4 sm:grid-cols-3">
					{/* Currency selector */}
					<div className="space-y-2">
						<Label htmlFor="fiat-select">{t('currency')}</Label>
						<Select value={selectedFiat} onValueChange={(v) => setSelectedFiat(v as FiatCurrency)}>
							<SelectTrigger id="fiat-select" className="w-full sm:w-48">
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
					{/* Price input */}
					<div className="sm:w-fit space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="price-input" className="flex items-center gap-2">
								<Coins className="h-4 w-4 text-muted-foreground" />
								{t('pricePerXNO')}
							</Label>
							<LockButton
								isLocked={lockedFields.has('price')}
								onToggle={() => toggleLock('price')}
								disabled={!canLock('price')}
							/>
						</div>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
								{fiatConfig.symbol}
							</span>
							<Input
								id="price-input"
								type="number"
								min={0}
								step={priceStep}
								value={price}
								onChange={(e) => solveSystem('price', Number.parseFloat(e.target.value) || 0)}
								className={cn(
									'pl-8 font-mono sm:w-auto',
									lockedFields.has('price') && 'ring-1 ring-amber-500/30',
								)}
							/>
						</div>
						<p className="text-xs text-muted-foreground flex items-center gap-1">
							{t('currentPrice')}: {fiatConfig.symbol}
							{xnoPriceInFiat.toFixed(4)}
							{price !== xnoPriceInFiat && (
								<button
									type="button"
									onClick={() => solveSystem('price', xnoPriceInFiat)}
									className="text-primary hover:underline ml-1"
								>
									({t('resetToMarket')})
								</button>
							)}
						</p>
					</div>

					{/* Amount input */}
					<div className="sm:w-fit space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="amount-input" className="flex items-center gap-2">
								<Wallet className="h-4 w-4 text-muted-foreground" />
								{t('amountToInvest')}
							</Label>
							<LockButton
								isLocked={lockedFields.has('amount')}
								onToggle={() => toggleLock('amount')}
								disabled={!canLock('amount')}
							/>
						</div>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
								{fiatConfig.symbol}
							</span>
							<Input
								id="amount-input"
								type="number"
								min={0}
								step="0.5"
								value={amount}
								onChange={(e) => solveSystem('amount', Number.parseFloat(e.target.value) || 0)}
								className={cn(
									'pl-8 font-mono sm:w-auto',
									lockedFields.has('amount') && 'ring-1 ring-amber-500/30',
								)}
							/>
						</div>
						<p className="text-xs text-muted-foreground">{t('perPerson')}</p>
					</div>
				</div>

				{/* People slider with lock and popover input */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<Label className="flex items-center gap-2">
							<Users className="h-4 w-4 text-muted-foreground" />
							{t('numberOfPeople')}
						</Label>
						<div className="flex items-center gap-2">
							<PeoplePopoverInput value={people} onChange={(v) => solveSystem('people', v)} t={t} />
							<LockButton
								isLocked={lockedFields.has('people')}
								onToggle={() => toggleLock('people')}
								disabled={!canLock('people')}
							/>
						</div>
					</div>
					<Slider
						value={[Math.log10(people) / 10]}
						onValueChange={(v: number[]) => {
							const linearValue = Math.round(10 ** (v[0] * 10))
							solveSystem('people', Math.max(1, linearValue))
						}}
						min={0}
						max={1}
						step={0.001}
						className={cn(
							'w-full',
							lockedFields.has('people') &&
								'**:data-[slot=slider-track]:ring-1 **:data-[slot=slider-track]:ring-amber-500/30',
						)}
					/>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>1</span>
						<span>10B</span>
					</div>
				</div>

				{/* Results - now editable with locks */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<EditableStatCard
						icon={<PiggyBank className="h-4 w-4" />}
						label={t('totalInvestment')}
						value={formatFiatPrice(totalInvestment, selectedFiat)}
						numericValue={totalInvestment}
						onValueChange={(v) => solveSystem('totalInvestment', v)}
						isLocked={lockedFields.has('totalInvestment')}
						onLockToggle={() => toggleLock('totalInvestment')}
						canLock={canLock('totalInvestment')}
						inputPrefix={fiatConfig.symbol}
						subValue={people > 1 ? `${people} × ${formatFiatPrice(amount, selectedFiat)}` : undefined}
					/>
					<EditableStatCard
						icon={<Coins className="h-4 w-4" />}
						label={t('totalXNO')}
						value={`${formatXNOAmount(totalXNO, { compact: false, showSymbol: false })}`}
						numericValue={totalXNO}
						onValueChange={(v) => solveSystem('totalXNO', v)}
						isLocked={lockedFields.has('totalXNO')}
						onLockToggle={() => toggleLock('totalXNO')}
						canLock={canLock('totalXNO')}
						inputSuffix="Ӿ"
						highlight
						max={XNO_TOTAL_SUPPLY}
						subValue={
							people > 1
								? `Ӿ ${formatXNOAmount(totalXNO / people, { compact: false, showSymbol: false })} ${t('perPerson')}`
								: undefined
						}
					/>
					<EditableStatCard
						icon={<Percent className="h-4 w-4" />}
						label={t('supplyPercentage')}
						value={formatPercentage(supplyPercentage, { highPrecision: true })}
						numericValue={supplyPercentage}
						onValueChange={handleSupplyPercentageChange}
						isLocked={lockedFields.has('totalXNO')}
						onLockToggle={() => toggleLock('totalXNO')}
						canLock={canLock('totalXNO')}
						inputSuffix="%"
						subValue={
							people > 1
								? `${formatPercentage(perPersonSupplyPercentage, { highPrecision: true })} ${t('perPerson')} · ${t('of')} ${XNO_TOTAL_SUPPLY.toLocaleString()} XNO`
								: `${t('of')} ${XNO_TOTAL_SUPPLY.toLocaleString()} XNO`
						}
						max={100}
						step={0.0001}
					/>
					{/* Holder tier - display only */}
					<div className={cn('p-4 rounded-lg border bg-card space-y-1 relative', tier.color)}>
						<HolderTierDialog
							currentTierKey={tierInfo.tierKey}
							currentPercentage={perPersonSupplyPercentage}
						/>
						<div className="flex items-center gap-2 text-sm text-muted-foreground pr-6">
							<span className="text-base">{tier.emoji}</span>
							{t('holderTier')}
						</div>
						<p className="text-2xl font-bold">{tier.label}</p>
					</div>
				</div>

				{/* Supply visualization */}
				<div
					className={cn(
						'space-y-3 p-4 rounded-lg border',
						isImpossibleScenario
							? 'bg-amber-500/10 border-amber-500/50'
							: 'bg-[#209CE9]/10 border-[#209CE9]/30',
					)}
				>
					<div className="flex items-center justify-between text-sm">
						<span className={isImpossibleScenario ? 'text-amber-500 font-medium' : 'text-muted-foreground'}>
							{t('supplyAcquired')}
						</span>
						<span className={cn('font-mono font-medium', isImpossibleScenario && 'text-amber-500')}>
							{isImpossibleScenario
								? formatPercentage(theoreticalSupplyPercentage, { highPrecision: true })
								: formatPercentage(supplyPercentage, { highPrecision: true })}
						</span>
					</div>
					<Progress
						value={Math.min(isImpossibleScenario ? theoreticalSupplyPercentage : supplyPercentage, 100)}
						className={cn(
							'h-3',
							isImpossibleScenario
								? '*:data-[slot=progress-indicator]:bg-amber-500'
								: '*:data-[slot=progress-indicator]:bg-[#209CE9]',
						)}
					/>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>0%</span>
						<span>
							{isImpossibleScenario ? (
								<span className="text-amber-500 font-medium">{t('exceedsSupply')}</span>
							) : (
								`${t('fixedSupply')}: Ӿ ${XNO_TOTAL_SUPPLY.toLocaleString()}`
							)}
						</span>
						<span>100%</span>
					</div>
				</div>
			</CardContent>
			<CardFooter className="w-full pb-4 flex-col gap-3 px-4">
				{/* Fun fact - based on per-person share */}
				{perPersonSupplyPercentage > 0 && (
					<div className="text-sm w-full text-muted-foreground bg-primary/5 rounded-lg p-4 border border-primary/10">
						<p>
							<span className="text-primary font-medium">{t('funFact')}:</span>{' '}
							{perPersonSupplyPercentage >= 1
								? t('funFactWhale', { percentage: perPersonSupplyPercentage.toFixed(2) })
								: perPersonSupplyPercentage >= 0.01
									? t('funFactNotable', {
											oneIn: Math.round(100 / perPersonSupplyPercentage).toLocaleString(),
										})
									: t('funFactStarting', {
											xno: formatXNOAmount(totalXNO / people, {
												compact: false,
												showSymbol: false,
											}),
										})}
						</p>
					</div>
				)}
				{/* Real fact - XNO supply % vs fiat M2 supply % comparison */}
				{amount > 0 &&
					perPersonSupplyPercentage > 0 &&
					(() => {
						const fiatM2Supply = ASSET_CONFIG[selectedFiat]?.staticSupply.current
						if (!fiatM2Supply) return null
						const fiatSupplyPercentage = (amount / fiatM2Supply) * 100
						const ratio = perPersonSupplyPercentage / fiatSupplyPercentage
						if (!Number.isFinite(ratio) || ratio <= 1) return null
						return (
							<div className="text-sm w-full text-muted-foreground bg-emerald-500/5 rounded-lg p-4 border border-emerald-500/10">
								<p>
									<span className="text-emerald-600 dark:text-emerald-400 font-medium">
										{t('realFact')}:
									</span>{' '}
									{t('realFactComparison', {
										xnoPercentage: formatPercentage(perPersonSupplyPercentage, {
											highPrecision: true,
										}),
										fiatPercentage: formatPercentage(fiatSupplyPercentage, { highPrecision: true }),
										ratio: Math.round(ratio).toLocaleString(),
										fiat: fiatConfig.label,
									})}
								</p>
							</div>
						)
					})()}
			</CardFooter>
		</Card>
	)
}
