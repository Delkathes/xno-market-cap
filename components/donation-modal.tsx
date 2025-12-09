'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Check, Copy, ExternalLink, Loader2 } from 'lucide-react'

import { validateDonationAmount, validateWebSocketConfirmation } from '@/lib/validation'
import { xnoToRaw, rawToXno } from '@/lib/nano-utils'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), {
	loading: () => <div className="w-[180px] h-[180px] animate-pulse bg-muted rounded" />,
	ssr: false,
})

interface DonationModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	currentDonations: number
	donationGoal: number
	onDonationReceived?: () => void
	goalMode: boolean
}

const DONATION_WALLET = process.env.NEXT_PUBLIC_DONATION_WALLET || ''
const FIXED_AMOUNTS = [1, 5, 10, 25, 50]

const WS_ENDPOINTS = ['wss://ws.nano.to']

const WS_INITIAL_RECONNECT_DELAY = 3000
const WS_MAX_RECONNECT_DELAY = 30000
const WS_MAX_RECONNECT_ATTEMPTS = 10

export function DonationModal({
	open,
	onOpenChange,
	currentDonations,
	donationGoal,
	onDonationReceived,
	goalMode,
}: DonationModalProps) {
	const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
	const [customAmount, setCustomAmount] = useState('')
	const [copied, setCopied] = useState(false)
	const [showQR, setShowQR] = useState(false)
	const [wsConnected, setWsConnected] = useState(false)
	const [paymentReceived, setPaymentReceived] = useState(false)
	const [receivedAmount, setReceivedAmount] = useState<number | null>(null)
	const [amountError, setAmountError] = useState<string | null>(null)
	const wsRef = useRef<WebSocket | null>(null)
	const wsEndpointIndexRef = useRef(0)
	const reconnectAttemptRef = useRef(0)
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const amount = selectedAmount ?? (customAmount ? Number.parseFloat(customAmount) : 0)
	const progress = Math.min((currentDonations / donationGoal) * 100, 100)

	const rawAmount = amount > 0 ? xnoToRaw(amount) : '0'
	const nanoUri = amount > 0 ? `nano:${DONATION_WALLET}?amount=${rawAmount}` : ''

	const getReconnectDelay = useCallback(() => {
		const delay = Math.min(
			WS_INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptRef.current),
			WS_MAX_RECONNECT_DELAY,
		)
		return delay
	}, [])

	const connectWebSocket = useCallback(() => {
		if (!DONATION_WALLET || wsRef.current?.readyState === WebSocket.OPEN) return

		if (reconnectAttemptRef.current >= WS_MAX_RECONNECT_ATTEMPTS) {
			console.error('Max WebSocket reconnection attempts reached')
			return
		}

		const endpoint = WS_ENDPOINTS[wsEndpointIndexRef.current]
		const ws = new WebSocket(endpoint)

		ws.onopen = () => {
			setWsConnected(true)
			reconnectAttemptRef.current = 0
			ws.send(
				JSON.stringify({
					action: 'subscribe',
					topic: 'confirmation',
				}),
			)
		}

		ws.onmessage = async (event) => {
			try {
				let text: string
				if (event.data instanceof Blob) {
					text = await event.data.text()
				} else {
					text = event.data
				}

				const data = JSON.parse(text)

				const validation = validateWebSocketConfirmation(data)
				if (!validation.success) {
					return
				}

				const validData = validation.output
				const msg = validData.message
				const block = msg.block

				const isIncomingToWallet = block.subtype === 'send' && block.link_as_account === DONATION_WALLET
				const isReceiveByWallet = block.subtype === 'receive' && msg.account === DONATION_WALLET

				if (isIncomingToWallet || isReceiveByWallet) {
					const receivedXno = rawToXno(msg.amount)
					setReceivedAmount(receivedXno)
					setPaymentReceived(true)
					onDonationReceived?.()
				}
			} catch {
				// Ignore parse errors
			}
		}

		ws.onerror = () => {
			setWsConnected(false)
			wsEndpointIndexRef.current = (wsEndpointIndexRef.current + 1) % WS_ENDPOINTS.length
		}

		ws.onclose = () => {
			setWsConnected(false)
			if (open && !paymentReceived) {
				reconnectAttemptRef.current++
				const delay = getReconnectDelay()
				reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay)
			}
		}

		wsRef.current = ws
	}, [open, onDonationReceived, paymentReceived, getReconnectDelay])

	useEffect(() => {
		if (open && showQR && amount > 0 && !paymentReceived) {
			connectWebSocket()
		}

		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current)
				reconnectTimeoutRef.current = null
			}
			if (wsRef.current && !paymentReceived) {
				wsRef.current.close()
				wsRef.current = null
			}
		}
	}, [open, showQR, amount, connectWebSocket, paymentReceived])

	const handleAmountSelect = (amt: number) => {
		if (paymentReceived) return
		const validation = validateDonationAmount(amt)
		if (!validation.success) {
			setAmountError(validation.error || 'Invalid amount')
			return
		}
		setAmountError(null)
		setSelectedAmount(amt)
		setCustomAmount('')
		setShowQR(true)
	}

	const handleCustomAmountChange = (value: string) => {
		if (paymentReceived) return
		const num = Number.parseFloat(value)

		if (value === '') {
			setCustomAmount('')
			setSelectedAmount(null)
			setShowQR(false)
			setAmountError(null)
			return
		}

		if (!isNaN(num)) {
			const validation = validateDonationAmount(num)
			if (!validation.success) {
				setAmountError(validation.error || 'Invalid amount')
				setCustomAmount(value)
				setSelectedAmount(null)
				setShowQR(false)
				return
			}
			setAmountError(null)
			setCustomAmount(value)
			setSelectedAmount(null)
			setShowQR(num > 0)
		}
	}

	const copyAddress = useCallback(async () => {
		await navigator.clipboard.writeText(DONATION_WALLET)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}, [])

	useEffect(() => {
		if (!open) {
			setSelectedAmount(null)
			setCustomAmount('')
			setShowQR(false)
			setPaymentReceived(false)
			setReceivedAmount(null)
			setAmountError(null)
			reconnectAttemptRef.current = 0
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current)
				reconnectTimeoutRef.current = null
			}
			if (wsRef.current) {
				wsRef.current.close()
				wsRef.current = null
			}
		}
	}, [open])

	const handleDonateAgain = () => {
		setPaymentReceived(false)
		setReceivedAmount(null)
		setSelectedAmount(null)
		setCustomAmount('')
		setShowQR(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{goalMode ? 'Donation Goal' : 'Support NanoMarketCap'}</DialogTitle>
					<DialogDescription>
						{goalMode
							? 'Help us reach our goal to open source this project'
							: 'Your donation helps keep this project running'}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{goalMode && (
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Progress</span>
								<span className="font-mono font-medium">
									{currentDonations.toLocaleString(undefined, { maximumFractionDigits: 2 })} /{' '}
									{donationGoal.toLocaleString()} XNO
								</span>
							</div>
							<Progress value={progress} className="h-3" />
							<p className="text-xs text-muted-foreground text-right">{progress.toFixed(1)}% complete</p>
						</div>
					)}

					{paymentReceived ? (
						<div className="space-y-4 py-4">
							<div className="flex flex-col items-center gap-3">
								<div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
									<Check className="w-10 h-10 text-green-500" />
								</div>
								<p className="text-xl font-medium text-green-500">Payment Received!</p>
								{receivedAmount && (
									<p className="text-lg font-mono text-foreground">{receivedAmount.toFixed(6)} XNO</p>
								)}
								<p className="text-sm text-muted-foreground text-center">
									{goalMode
										? "Thank you for your generous donation. You're helping make NanoMarketCap open source!"
										: 'Thank you for your generous donation. Your support keeps this project running!'}
								</p>
							</div>

							<div className="flex gap-2 pt-2">
								<Button variant="outline" className="flex-1 bg-transparent" onClick={handleDonateAgain}>
									Donate Again
								</Button>
								<Button
									variant="outline"
									className="flex-1 bg-transparent"
									onClick={() =>
										window.open(`https://blocklattice.io/account/${DONATION_WALLET}`, '_blank')
									}
								>
									<ExternalLink className="h-4 w-4 mr-2" />
									View Wallet
								</Button>
							</div>
						</div>
					) : (
						<>
							{goalMode ? (
								<>
									{/* Goal Explanation - Only in goal mode */}
									<Card>
										<CardContent className="p-4 text-sm space-y-2">
											<p className="font-medium text-foreground">
												What happens when we reach {donationGoal.toLocaleString()} XNO?
											</p>
											<ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
												<li>Full source code released on GitHub</li>
												<li>One-click free Deploy button for Vercel</li>
												<li>Everyone can host their own NanoMarketCap, for free</li>
												<li>Community-driven development</li>
											</ul>
										</CardContent>
									</Card>

									{/* Fund Usage Explanation */}
									<Card>
										<CardContent className="p-4 text-sm space-y-2">
											<p className="font-medium text-foreground">How will the funds be used?</p>
											<ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
												<li>Hosting and infrastructure costs for this website</li>
												<li>Refund LLM code generation costs</li>
												<li>Supporting the developer (rent and living expenses)</li>
												<li>Building more XNO-related websites and tools</li>
											</ul>
										</CardContent>
									</Card>
								</>
							) : (
								/* Regular donation mode - Just fund usage */
								<Card>
									<CardContent className="p-4 text-sm space-y-2">
										<p className="font-medium text-foreground">How will your donation be used?</p>
										<ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
											<li>Hosting and infrastructure costs for this website</li>
											<li>Supporting the developer (rent and living expenses)</li>
											<li>Building more XNO-related websites and tools</li>
										</ul>
									</CardContent>
								</Card>
							)}

							{/* Amount Selection */}
							<div className="space-y-3">
								<p className="text-sm font-medium">Select donation amount (XNO)</p>
								<div className="flex flex-wrap gap-2">
									{FIXED_AMOUNTS.map((amt) => (
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
										placeholder="Custom amount"
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
							{showQR && amount > 0 && (
								<div className="space-y-4 pt-2 border-t border-border">
									<div className="flex flex-col items-center gap-4">
										<div className="bg-white p-4 rounded-lg">
											<QRCodeSVG value={nanoUri} size={180} level="M" includeMargin={false} />
										</div>
										<p className="text-sm text-muted-foreground text-center">
											Scan with your Nano wallet to send{' '}
											<span className="font-mono font-medium text-primary">{amount} XNO</span>
										</p>
										<div className="flex items-center gap-2 text-xs">
											{wsConnected ? (
												<>
													<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
													<span className="text-muted-foreground">
														Listening for payment...
													</span>
												</>
											) : (
												<>
													<Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
													<span className="text-muted-foreground">Connecting...</span>
												</>
											)}
										</div>
									</div>

									{/* Wallet Address */}
									<div className="space-y-2">
										<p className="text-xs text-muted-foreground">Donation wallet address:</p>
										<div className="flex items-center gap-2">
											<code className="flex-1 text-xs bg-muted p-2 rounded font-mono break-all">
												{DONATION_WALLET}
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
										onClick={() =>
											window.open(`https://blocklattice.io/account/${DONATION_WALLET}`, '_blank')
										}
									>
										<ExternalLink className="h-4 w-4 mr-2" />
										View on Blocklattice
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
