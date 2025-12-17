'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { WS_ENDPOINTS } from '@/lib/constants'
import { rawToXno } from '@/lib/nano-utils'
import { validateWebSocketConfirmation } from '@/lib/validation'

const WS_INITIAL_RECONNECT_DELAY = 3000
const WS_MAX_RECONNECT_DELAY = 30000
const WS_MAX_RECONNECT_ATTEMPTS = 10

interface UseDonationWebSocketOptions {
	shouldListen: boolean
	walletAddress: string
	onDonationReceived?: () => void
}

interface UseDonationWebSocketReturn {
	wsConnected: boolean
	paymentReceived: boolean
	receivedAmount: number | null
	reset: () => void
}

export function useDonationWebSocket({
	shouldListen,
	walletAddress,
	onDonationReceived,
}: UseDonationWebSocketOptions): UseDonationWebSocketReturn {
	const [wsConnected, setWsConnected] = useState(false)
	const [paymentReceived, setPaymentReceived] = useState(false)
	const [receivedAmount, setReceivedAmount] = useState<number | null>(null)

	const wsRef = useRef<WebSocket | null>(null)
	const wsEndpointIndexRef = useRef(0)
	const reconnectAttemptRef = useRef(0)
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	// Use refs for values accessed in callbacks to avoid stale closures
	const onDonationReceivedRef = useRef(onDonationReceived)
	useEffect(() => {
		onDonationReceivedRef.current = onDonationReceived
	}, [onDonationReceived])

	const cleanupConnection = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current)
			reconnectTimeoutRef.current = null
		}

		if (wsRef.current) {
			wsRef.current.onopen = null
			wsRef.current.onclose = null
			wsRef.current.onmessage = null
			wsRef.current.onerror = null
			wsRef.current.close()
			wsRef.current = null
		}
	}, [])

	const reset = useCallback(() => {
		reconnectAttemptRef.current = 0
		wsEndpointIndexRef.current = 0
		setWsConnected(false)
		setPaymentReceived(false)
		setReceivedAmount(null)
		cleanupConnection()
	}, [cleanupConnection])

	// Connection effect - separated from state management
	useEffect(() => {
		if (!walletAddress || !shouldListen || paymentReceived) {
			cleanupConnection()
			return
		}

		let isMounted = true

		const getReconnectDelay = () => {
			const attempt = reconnectAttemptRef.current
			return Math.min(WS_INITIAL_RECONNECT_DELAY * 2 ** attempt, WS_MAX_RECONNECT_DELAY)
		}

		const connect = () => {
			if (!isMounted || wsRef.current?.readyState === WebSocket.OPEN) return

			if (reconnectAttemptRef.current >= WS_MAX_RECONNECT_ATTEMPTS) {
				console.error('Max WebSocket reconnection attempts reached')
				return
			}

			const endpoint = WS_ENDPOINTS[wsEndpointIndexRef.current]
			const ws = new WebSocket(endpoint)

			ws.onopen = () => {
				if (!isMounted) return
				setWsConnected(true)
				reconnectAttemptRef.current = 0
				ws.send(JSON.stringify({ action: 'subscribe', topic: 'confirmation' }))
			}

			ws.onmessage = async (event) => {
				if (!isMounted) return

				try {
					const text = event.data instanceof Blob ? await event.data.text() : (event.data as string)
					const data = JSON.parse(text)

					const validation = validateWebSocketConfirmation(data)
					if (!validation.success) return

					const { message: msg } = validation.output
					const { block } = msg

					const isIncomingToWallet = block.subtype === 'send' && block.link_as_account === walletAddress
					const isReceiveByWallet = block.subtype === 'receive' && msg.account === walletAddress

					if (isIncomingToWallet || isReceiveByWallet) {
						setReceivedAmount(rawToXno(msg.amount))
						setPaymentReceived(true)
						onDonationReceivedRef.current?.()
					}
				} catch {
					// Ignore parse errors
				}
			}

			ws.onerror = () => {
				if (!isMounted) return
				setWsConnected(false)
				wsEndpointIndexRef.current = (wsEndpointIndexRef.current + 1) % WS_ENDPOINTS.length
			}

			ws.onclose = () => {
				if (!isMounted) return
				setWsConnected(false)

				reconnectAttemptRef.current += 1
				const delay = getReconnectDelay()
				reconnectTimeoutRef.current = setTimeout(connect, delay)
			}

			wsRef.current = ws
		}

		connect()

		return () => {
			isMounted = false
			cleanupConnection()
		}
	}, [shouldListen, paymentReceived, walletAddress, cleanupConnection])

	return { wsConnected, paymentReceived, receivedAmount, reset }
}
