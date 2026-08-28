'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as v from 'valibot'

import { WS_ENDPOINTS } from '@/lib/constants'
import { rawToXno } from '@/lib/nano-utils'

const WS_INITIAL_RECONNECT_DELAY = 3000
const WS_MAX_RECONNECT_DELAY = 30000
const WS_MAX_RECONNECT_ATTEMPTS = 10

const AccountConfirmationSchema = v.object({
	topic: v.literal('confirmation'),
	message: v.object({
		account: v.string(),
		amount: v.string(),
		hash: v.string(),
		block: v.object({
			account: v.string(),
			subtype: v.string(),
			link_as_account: v.optional(v.string()),
		}),
	}),
})

// Module-level index for fair round-robin distribution across WebSocket endpoints
let globalWsEndpointIndex = 0

function getNextWsEndpointIndex(): number {
	const index = globalWsEndpointIndex
	globalWsEndpointIndex = (globalWsEndpointIndex + 1) % WS_ENDPOINTS.length
	return index
}

export interface LiveTransaction {
	hash: string
	subtype: 'send' | 'receive' | 'change' | string
	amountXno: number
	counterparty: string
	timestamp: number
}

interface UseAccountConfirmationsOptions {
	address: string
	/** True while the account page is mounted and the tab is visible. */
	enabled: boolean
	onNewBlock: (entry: LiveTransaction) => void
	onWifiStateChange?: (connected: boolean) => void
}

/**
 * Live confirmation feed for a single account, gated on tab visibility.
 * New confirmed blocks for the address push via WebSocket; when the socket
 * fails permanently the caller falls back to the regular 60s polling.
 */
export function useAccountConfirmations({
	address,
	enabled,
	onNewBlock,
	onWifiStateChange,
}: UseAccountConfirmationsOptions) {
	const [wsConnected, setWsConnected] = useState(false)

	const wsRef = useRef<WebSocket | null>(null)
	const wsEndpointIndexRef = useRef(0)
	const reconnectAttemptRef = useRef(0)
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const disabledRef = useRef(true)
	const onNewBlockRef = useRef(onNewBlock)
	const onWifiStateChangeRef = useRef(onWifiStateChange)

	useEffect(() => {
		onNewBlockRef.current = onNewBlock
		onWifiStateChangeRef.current = onWifiStateChange
	}, [onNewBlock, onWifiStateChange])

	useEffect(() => {
		disabledRef.current = !enabled
	}, [enabled])

	const setConnected = useCallback((connected: boolean) => {
		setWsConnected(connected)
		onWifiStateChangeRef.current?.(connected)
	}, [])

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

	useEffect(() => {
		if (!address || !enabled) {
			reconnectAttemptRef.current = 0
			cleanupConnection()
			return
		}

		let isMounted = true

		const getReconnectDelay = () => {
			const attempt = reconnectAttemptRef.current
			return Math.min(WS_INITIAL_RECONNECT_DELAY * 2 ** attempt, WS_MAX_RECONNECT_DELAY)
		}

		const connect = () => {
			if (!isMounted || disabledRef.current || wsRef.current?.readyState === WebSocket.OPEN) return

			if (reconnectAttemptRef.current >= WS_MAX_RECONNECT_ATTEMPTS) {
				console.error('Max WebSocket reconnection attempts reached')
				setConnected(false)
				return
			}

			wsEndpointIndexRef.current = getNextWsEndpointIndex()
			const endpoint = WS_ENDPOINTS[wsEndpointIndexRef.current]
			const ws = new WebSocket(endpoint)

			ws.onopen = () => {
				if (!isMounted || disabledRef.current) return
				setConnected(true)
				reconnectAttemptRef.current = 0
				ws.send(JSON.stringify({ action: 'subscribe', topic: 'confirmation', accounts: [address] }))
			}

			ws.onmessage = async (event) => {
				if (!isMounted || disabledRef.current) return
				try {
					const text = event.data instanceof Blob ? await event.data.text() : (event.data as string)
					const data: unknown = JSON.parse(text)
					const validation = v.safeParse(AccountConfirmationSchema, data)
					if (!validation.success) return

					const { message: msg } = validation.output
					const { block } = msg
					const subtype = block.subtype

					const isReceive = subtype === 'receive' && msg.account === address
					const isSend = subtype === 'send' && block.link_as_account === address
					const isChange = subtype === 'change' && msg.account === address
					if (!isReceive && !isSend && !isChange) return

					onNewBlockRef.current({
						hash: msg.hash,
						subtype,
						amountXno: rawToXno(msg.amount),
						counterparty: isReceive ? block.account : isSend ? msg.account : '',
						timestamp: Math.floor(Date.now() / 1000),
					})
				} catch {
					// Ignore malformed frames
				}
			}

			ws.onerror = () => {
				if (!isMounted) return
				setConnected(false)
				wsEndpointIndexRef.current = (wsEndpointIndexRef.current + 1) % WS_ENDPOINTS.length
			}

			ws.onclose = () => {
				if (!isMounted) return
				setConnected(false)
				if (disabledRef.current) return
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
	}, [address, enabled, cleanupConnection, setConnected])

	return { wsConnected }
}
