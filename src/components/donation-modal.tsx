'use client'

import dynamic from 'next/dynamic'
import { useCallback, useMemo, useState } from 'react'
import { Check, CheckCircle2, Code, Copy, ExternalLink, Loader2, Rocket, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { BLOCKLATTICE_URL, DONATION_FIXED_AMOUNTS } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { useDonation } from '@/hooks/use-donation'

import { env } from '@/env'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), {
	loading: () => <div className="w-45 h-45 animate-pulse bg-muted rounded" />,
	ssr: false,
})

export type MilestoneId = 'development' | 'maintenance' | 'opensource'
export type MilestoneIcon = 'rocket' | 'shield' | 'code' | 'heart'
export type MilestoneBalances = Record<string, number>

export interface DonationMilestoneConfig {
	id: MilestoneId
	targetXno: number
	walletAddress: string
	icon: MilestoneIcon
	rewardCount: number
}

export const DONATION_MILESTONES: DonationMilestoneConfig[] = [
	{
		id: 'development',
		targetXno: 3000,
		walletAddress: env.NEXT_PUBLIC_DONATION_WALLET_DEVELOPMENT,
		icon: 'rocket',
		rewardCount: 3,
	},
	{
		id: 'maintenance',
		targetXno: 18000,
		walletAddress: env.NEXT_PUBLIC_DONATION_WALLET_MAINTENANCE,
		icon: 'shield',
		rewardCount: 3,
	},
	{
		id: 'opensource',
		targetXno: 4000,
		walletAddress: env.NEXT_PUBLIC_DONATION_WALLET_OPENSOURCE,
		icon: 'code',
		rewardCount: 3,
	},
]

const cumulativeTargets = getCumulativeTargets(DONATION_MILESTONES)

// Helper to get total donation goal across all milestones
export const DONATION_GOAL_XNO = DONATION_MILESTONES.reduce((sum, m) => sum + m.targetXno, 0)

interface DonationModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	milestoneBalances: MilestoneBalances
	totalDonations: number
	onDonationReceived?: () => void
	goalMode: boolean
	allMilestonesComplete: boolean
	activeWalletAddress: string
}

export function DonationModal({
	open,
	onOpenChange,
	milestoneBalances,
	totalDonations,
	onDonationReceived,
	goalMode,
	allMilestonesComplete,
	activeWalletAddress,
}: DonationModalProps) {
	const t = useTranslations('donation')

	const [copied, setCopied] = useState(false)

	const {
		amount,
		nanoUri,
		selectedAmount,
		customAmount,
		amountError,
		shouldShowQr,
		wsConnected,
		paymentReceived,
		receivedAmount,
		handleAmountSelect,
		handleCustomAmountChange,
		reset,
	} = useDonation({ isOpen: open, onDonationReceived, walletAddress: activeWalletAddress })

	const walletUrl = `${BLOCKLATTICE_URL}/account/${activeWalletAddress}`

	const copyAddress = useCallback(async () => {
		await navigator.clipboard.writeText(activeWalletAddress)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}, [activeWalletAddress])

	const handleDonateAgain = useCallback(() => {
		reset()
		setCopied(false)
	}, [reset])

	// Calculate milestone progress based on per-wallet balances
	const milestoneProgress = useMemo(() => {
		let previousComplete = true // First milestone is always "unlocked"

		return DONATION_MILESTONES.map((milestone) => {
			const balance = milestoneBalances[milestone.id] || 0
			const progress = Math.min((balance / milestone.targetXno) * 100, 100)
			const isComplete = balance >= milestone.targetXno
			const isActive = previousComplete && !isComplete

			// Update for next iteration - milestone must be unlocked sequentially
			const wasComplete = previousComplete
			previousComplete = previousComplete && isComplete

			return {
				...milestone,
				balance,
				progress,
				isComplete,
				isActive,
				isLocked: !wasComplete, // Locked if previous milestone wasn't complete
			}
		})
	}, [milestoneBalances])

	const overallProgress = Math.min((totalDonations / DONATION_GOAL_XNO) * 100, 100)

	// Get stats for a specific milestone (now uses wallet balance directly)
	const getMilestoneStats = useCallback(
		(milestoneId: string): { amount: number; progress: number; received: number } => {
			const milestone = DONATION_MILESTONES.find((m) => m.id === milestoneId)
			if (!milestone) return { amount: 0, progress: 0, received: 0 }

			const balance = milestoneBalances[milestoneId] || 0
			const progress = Math.min((balance / milestone.targetXno) * 100, 100)

			return {
				amount: milestone.targetXno,
				progress,
				received: Math.min(balance, milestone.targetXno),
			}
		},
		[milestoneBalances],
	)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader className="pb-2">
					<DialogTitle>{goalMode ? t('donationGoal') : t('supportNanoMarketCap')}</DialogTitle>
					<DialogDescription>
						{goalMode ? t('goalModeDescription') : t('regularModeDescription')}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{goalMode && !allMilestonesComplete && (
						<div className="space-y-4">
							{/* Overall Progress */}
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<div className="flex flex-col-reverse">{t('overallProgress')}</div>
									<div className="flex flex-col items-end">
										<span className="text-xs text-primary">{overallProgress.toFixed(1)}%</span>
										<span className="font-mono font-medium">
											{totalDonations.toLocaleString(undefined, {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}{' '}
											/ {DONATION_GOAL_XNO.toLocaleString()} XNO
										</span>
									</div>
								</div>

								{/* Multi-step Progress Bar */}
								<div className="relative pb-3">
									<Progress value={overallProgress} className="h-3" />
									{/* Milestone markers */}
									<div className="absolute inset-0 flex">
										<span
											className={cn(
												'absolute top-4 -translate-x-1/2 transition-colors text-[10px] text-primary font-medium',
											)}
										>
											0
										</span>
										{cumulativeTargets.slice(0, -1).map((target) => (
											<div
												key={target.id}
												className="absolute top-0 bottom-0 w-0.5 bg-background"
												style={{ left: `${(target.cumulative / DONATION_GOAL_XNO) * 100}%` }}
											>
												<span
													className={cn(
														'absolute top-4 -translate-x-1/2 transition-colors text-[10px] text-primary font-medium',
													)}
												>
													{target.cumulative.toLocaleString()}
												</span>
											</div>
										))}
										<span
											className={cn(
												'absolute right-0 top-4 transition-colors text-[10px] text-primary font-medium',
											)}
										>
											{DONATION_GOAL_XNO.toLocaleString()}
										</span>
									</div>
								</div>
							</div>

							{/* Milestone Cards */}
							<div className="space-y-2">
								{milestoneProgress.map((milestone) => (
									<div
										key={milestone.id}
										className={cn(
											'relative rounded-lg border p-3 transition-all duration-300',
											milestone.isComplete
												? 'border-primary/50 bg-primary/5'
												: milestone.isActive
													? 'border-primary bg-primary/10 ring-1 ring-primary/20'
													: 'border-border bg-muted/30 opacity-60',
										)}
									>
										<div className="flex items-start gap-3 relative">
											{/* Step indicator */}
											<div
												className={cn(
													'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
													milestone.isComplete
														? 'border-primary bg-primary text-primary-foreground'
														: milestone.isActive
															? 'border-primary bg-background'
															: 'border-muted-foreground/30 bg-muted',
												)}
											>
												{milestone.isComplete ? (
													<CheckCircle2 className="h-4 w-4" />
												) : (
													getMilestoneIcon(
														milestone.icon,
														milestone.isComplete,
														milestone.isActive,
													)
												)}
											</div>

											{/* Content */}
											<div className="flex-1 min-w-0">
												<div className="flex justify-between gap-2">
													<h4
														className={cn(
															'font-medium text-sm',
															milestone.isComplete || milestone.isActive
																? 'text-foreground'
																: 'text-muted-foreground',
														)}
													>
														{t(`milestones.${milestone.id}.title`)}
													</h4>
													<div className="absolute right-0 top-0 flex flex-col items-end">
														{(milestone.isActive || milestone.isComplete) && (
															<span className="text-xs text-primary">
																{getMilestoneStats(milestone.id).progress.toFixed(1)}%
															</span>
														)}
														<span
															className={cn(
																'text-xs font-mono shrink-0',
																milestone.isComplete
																	? 'text-primary'
																	: milestone.isActive
																		? 'text-foreground'
																		: 'text-muted-foreground',
															)}
														>
															{milestone.isActive
																? `${getMilestoneStats(milestone.id).received.toLocaleString()} / ${getMilestoneStats(milestone.id).amount.toLocaleString()}`
																: getMilestoneStats(
																		milestone.id,
																	).amount.toLocaleString()}{' '}
															XNO
														</span>
													</div>
												</div>

												{/* Always show rewards for all milestones */}
												<div className="mt-2 space-y-1">
													<ul
														className={cn(
															'text-xs space-y-0.5',
															milestone.isComplete || milestone.isActive
																? 'text-muted-foreground'
																: 'text-muted-foreground/70',
														)}
													>
														{Array.from({ length: milestone.rewardCount }, (_, i) => (
															<li
																key={`${milestone.id}-reward-${i + 1}`}
																className="flex items-center gap-1.5"
															>
																<span
																	className={cn(
																		'h-1 w-1 rounded-full',
																		milestone.isComplete
																			? 'bg-primary'
																			: milestone.isActive
																				? 'bg-primary'
																				: 'bg-muted-foreground/50',
																	)}
																/>
																{t(`milestones.${milestone.id}.reward${i + 1}`)}
															</li>
														))}
													</ul>
												</div>

												{/* Progress within milestone */}
												{milestone.isActive && (
													<div className="mt-2">
														<Progress value={milestone.progress} className="h-1.5" />
													</div>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{paymentReceived ? (
						<div className="space-y-4 py-4">
							<div className="flex flex-col items-center gap-3">
								<div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
									<Check className="w-10 h-10 text-green-500" />
								</div>
								<p className="text-xl font-medium text-green-500">{t('paymentReceived')}</p>
								{receivedAmount && (
									<p className="text-lg font-mono text-foreground">{receivedAmount.toFixed(6)} XNO</p>
								)}
								<p className="text-sm text-muted-foreground text-center">
									{goalMode ? t('thankYouGoalMode') : t('thankYouRegularMode')}
								</p>
							</div>

							<div className="flex gap-2 pt-2">
								<Button variant="outline" className="flex-1 bg-transparent" onClick={handleDonateAgain}>
									{t('donateAgain')}
								</Button>
								<Button
									variant="outline"
									className="flex-1 bg-transparent"
									onClick={() => window.open(walletUrl, '_blank')}
								>
									<ExternalLink className="h-4 w-4 mr-2" />
									{t('viewWallet')}
								</Button>
							</div>
						</div>
					) : (
						<>
							{!goalMode && (
								/* Regular donation mode - Just fund usage */
								<div className="rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-2">
									<p className="font-medium text-foreground">{t('howWillBeUsed')}</p>
									<ul className="text-muted-foreground space-y-1">
										<li className="flex items-center gap-2">
											<span className="h-1.5 w-1.5 rounded-full bg-primary" />
											{t('usageHosting')}
										</li>
										<li className="flex items-center gap-2">
											<span className="h-1.5 w-1.5 rounded-full bg-primary" />
											{t('usageDeveloper')}
										</li>
										<li className="flex items-center gap-2">
											<span className="h-1.5 w-1.5 rounded-full bg-primary" />
											{t('usageTools')}
										</li>
									</ul>
								</div>
							)}

							{/* Amount Selection */}
							<div className="space-y-3">
								<p className="text-sm font-medium">{t('selectAmount')}</p>
								<div className="flex flex-wrap gap-2">
									{DONATION_FIXED_AMOUNTS.map((amt) => (
										<Button
											key={amt}
											variant={selectedAmount === amt ? 'default' : 'outline'}
											size="sm"
											onClick={() => handleAmountSelect(amt)}
											className="font-mono"
										>
											{amt} XNO
										</Button>
									))}
								</div>
								<div className="flex items-center gap-2">
									<Input
										type="number"
										placeholder={t('customAmount')}
										value={customAmount}
										onChange={(e) => handleCustomAmountChange(e.target.value)}
										className="font-mono"
										min="0"
										step="0.01"
										max="1000000"
									/>
									<span className="text-sm text-muted-foreground">XNO</span>
								</div>
								{amountError && <p className="text-sm text-destructive">{amountError}</p>}
							</div>

							{/* QR Code Section */}
							{shouldShowQr && amount > 0 && (
								<div className="space-y-4 pt-4 border-t border-border">
									<div className="flex flex-col items-center gap-4">
										<div className="bg-white p-4 rounded-lg">
											<QRCodeSVG value={nanoUri} size={180} level="M" includeMargin={false} />
										</div>
										<p className="text-sm text-muted-foreground text-center">
											{t('scanToSend')}{' '}
											<span className="font-mono font-medium text-primary">{amount} XNO</span>
										</p>
										<div className="flex items-center gap-2 text-xs">
											{wsConnected ? (
												<>
													<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
													<span className="text-muted-foreground">
														{t('listeningForPayment')}
													</span>
												</>
											) : (
												<>
													<Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
													<span className="text-muted-foreground">{t('connecting')}</span>
												</>
											)}
										</div>
									</div>

									{/* Wallet Address */}
									<div className="space-y-2">
										<p className="text-xs text-muted-foreground">{t('walletAddress')}</p>
										<div className="flex items-center gap-2">
											<code className="flex-1 text-xs bg-muted p-2 rounded font-mono break-all">
												{activeWalletAddress}
											</code>
											<Button
												variant="outline"
												size="icon"
												onClick={copyAddress}
												className="shrink-0 bg-transparent"
											>
												{copied ? (
													<Check className="h-4 w-4 text-green-500" />
												) : (
													<Copy className="h-4 w-4" />
												)}
											</Button>
										</div>
									</div>

									<Button
										variant="outline"
										className="w-full bg-transparent"
										onClick={() => window.open(walletUrl, '_blank')}
									>
										<ExternalLink className="h-4 w-4 mr-2" />
										{t('viewOnBlocklattice')}
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

function getMilestoneIcon(icon: MilestoneIcon, isComplete: boolean, isActive: boolean) {
	const className = cn(
		'h-5 w-5 transition-colors',
		isComplete ? 'text-primary' : isActive ? 'text-primary' : 'text-muted-foreground/50',
	)
	switch (icon) {
		case 'rocket':
			return <Rocket className={className} />
		case 'shield':
			return <Shield className={className} />
		case 'code':
			return <Code className={className} />
		default:
			return <Rocket className={className} />
	}
}

// Calculate cumulative targets for progress bar markers
function getCumulativeTargets(donationMilestones: DonationMilestoneConfig[]) {
	let cumulative = 0
	return donationMilestones.map((milestone) => {
		cumulative += milestone.targetXno
		return { id: milestone.id, cumulative }
	})
}
