'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as v from 'valibot'

import { WS_ENDPOINTS } from '@/lib/constants'
import { rawToXno } from '@/lib/nano-utils'

const WS_INITIAL_RECONNECT_DELAY = 3000
const WS_MAX_RECONNECT_DELAY = 30000
const WS_MAX_RECONNECT_ATTEMPTS = 10
const FEED_CAP = 12

const NetworkConfirmationSchema = v.object({
	topic: v.literal('confirmation'),
	message: v.object({
		account: v.string(),
		amount: v.string(),
		hash: v.string(),
		block: v.object({
			account: v.optional(v.string()),
			subtype: v.optional(v.string()),
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

export interface NetworkConfirmation {
	hash: string
	account: string
	subtype: string
	amountXno: number
	counterparty: string
	timestamp: number
}

export type FeedStatus = 'live' | 'connecting' | 'offline'

/**
 * Network-wide confirmation feed: subscribes to the `confirmation` topic
 * without an account filter, so every confirmed block on the network streams
 * in. Round-robin endpoints with exponential backoff (same skeleton as the
 * account feed). There is no RPC fallback (confirmation_history is not
 * supported on any public relay), so the feed shows a clear offline state.
 */
export function useNetworkConfirmations(): {
	confirmations: NetworkConfirmation[]
	status: FeedStatus
} {
	const [confirmations, setConfirmations] = useState<NetworkConfirmation[]>([])
	const [status, setStatus] = useState<FeedStatus>('connecting')

	const wsRef = useRef<WebSocket | null>(null)
	const reconnectAttemptRef = useRef(0)
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
		let isMounted = true

		const getReconnectDelay = () => {
			const attempt = reconnectAttemptRef.current
			return Math.min(WS_INITIAL_RECONNECT_DELAY * 2 ** attempt, WS_MAX_RECONNECT_DELAY)
		}

		const connect = () => {
			if (!isMounted || wsRef.current?.readyState === WebSocket.OPEN) return

			if (reconnectAttemptRef.current >= WS_MAX_RECONNECT_ATTEMPTS) {
				setStatus('offline')
				return
			}

			const endpoint = WS_ENDPOINTS[getNextWsEndpointIndex()]
			const ws = new WebSocket(endpoint)

			ws.onopen = () => {
				if (!isMounted) return
				setStatus('live')
				reconnectAttemptRef.current = 0
				ws.send(JSON.stringify({ action: 'subscribe', topic: 'confirmation' }))
			}

			ws.onmessage = async (event) => {
				if (!isMounted) return
				try {
					const text = event.data instanceof Blob ? await event.data.text() : (event.data as string)
					const data: unknown = JSON.parse(text)
					const validation = v.safeParse(NetworkConfirmationSchema, data)
					if (!validation.success) return

					const { message: msg } = validation.output
					const subtype = msg.block.subtype ?? 'confirmed'
					const entry: NetworkConfirmation = {
						hash: msg.hash,
						account: msg.account,
						subtype,
						amountXno: rawToXno(msg.amount),
						counterparty: subtype === 'send' ? (msg.block.link_as_account ?? '') : '',
						timestamp: Math.floor(Date.now() / 1000),
					}

					setConfirmations((current) => {
						if (current.some((item) => item.hash === entry.hash)) return current
						return [entry, ...current].slice(0, FEED_CAP)
					})
				} catch {
					// Ignore malformed frames
				}
			}

			ws.onerror = () => {
				if (!isMounted) return
				setStatus('connecting')
			}

			ws.onclose = () => {
				if (!isMounted) return
				reconnectAttemptRef.current += 1
				setStatus(reconnectAttemptRef.current >= WS_MAX_RECONNECT_ATTEMPTS ? 'offline' : 'connecting')
				reconnectTimeoutRef.current = setTimeout(connect, getReconnectDelay())
			}

			wsRef.current = ws
		}

		connect()

		return () => {
			isMounted = false
			cleanupConnection()
		}
	}, [cleanupConnection])

	return { confirmations, status }
}
