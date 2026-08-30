'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as v from 'valibot'

import { WS_NETWORK_ENDPOINTS } from '@/lib/constants'
import { rawToXno } from '@/lib/nano-utils'

const WS_INITIAL_RECONNECT_DELAY = 3000
const WS_MAX_RECONNECT_DELAY = 30000
const WS_MAX_RECONNECT_ATTEMPTS = 10
// After the backoff budget is spent the feed keeps retrying on a fixed slow
// interval instead of dying: embeds live on third-party sites for days and a
// permanent 'offline' state would only clear on a full page reload.
const WS_RETRY_FOREVER_DELAY = 30000
// If the socket hasn't reached OPEN within this window the handshake is
// considered hung (some relays black-hole connections): force-close so the
// reconnect path cycles to the next endpoint instead of sitting in limbo.
const WS_CONNECT_WATCHDOG_MS = 10000
// If no VALID confirmation frame arrives within this window after OPEN the
// relay is considered dead-but-open (node.somenano.com behaves exactly like
// this): force one reconnect cycle to the next endpoint. Network-wide
// confirmations never pause this long, so healthy relays are unaffected.
const WS_FIRST_FRAME_MS = 12000
// If no confirmation frame arrives for this long while the socket is OPEN it
// is likely a zombie (TCP alive, relay silently stopped forwarding). Force
// one reconnect cycle; the window restarts on open, so a genuinely quiet
// network only pays one churn per quiet period.
const WS_STALE_AFTER_MS = 120000
const WS_STALE_CHECK_INTERVAL_MS = 30000
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
	globalWsEndpointIndex = (globalWsEndpointIndex + 1) % WS_NETWORK_ENDPOINTS.length
	return index
}

// The last relay that actually delivered a confirmation in this browser:
// fresh page loads start there instead of always landing on the first
// endpoint. Written only on delivery (not on open), so a dead-but-open relay
// can never be remembered as the preferred one. Consumed once per connect;
// subsequent failures fall back to the rotation.
const WS_PREFERRED_KEY = 'nmc.ws.preferred'
let preferredWsIndex: number | null = null
if (typeof window !== 'undefined') {
	try {
		const stored = Number(localStorage.getItem(WS_PREFERRED_KEY))
		if (Number.isInteger(stored) && stored >= 0 && stored < WS_NETWORK_ENDPOINTS.length) {
			preferredWsIndex = stored
		}
	} catch {
		// localStorage unavailable (private mode, disabled): ignore
	}
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
 * in. Round-robin across WS_NETWORK_ENDPOINTS (relays verified to actually
 * deliver network-wide confirmations; rainstorm and somenano don't) with
 * exponential backoff, and four resilience layers for long-lived embeds: a
 * hung-handshake watchdog, a dead-but-open failover (no valid frame within
 * 12s of OPEN), a stale-socket reconnect (no data for 2 minutes while OPEN),
 * and a fixed 30s retry loop that never gives up after the backoff budget is
 * spent (there is no RPC fallback: confirmation_history is unsupported on
 * public relays). Also recovers immediately when the tab/iframe becomes
 * visible again, since backgrounded tabs throttle the reconnect timers.
 * Fresh page loads start on the last relay that actually delivered a
 * confirmation in this browser (localStorage), so a relay that one visitor's
 * network can't reach only costs one failed attempt, never a broken first
 * paint.
 */
export function useNetworkConfirmations(): {
	confirmations: NetworkConfirmation[]
	/** Cumulative count of unique confirmed blocks seen since mount. */
	totalSeen: number
	status: FeedStatus
} {
	const [confirmations, setConfirmations] = useState<NetworkConfirmation[]>([])
	const [status, setStatus] = useState<FeedStatus>('connecting')

	const wsRef = useRef<WebSocket | null>(null)
	const reconnectAttemptRef = useRef(0)
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const firstFrameTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const lastMessageAtRef = useRef(0)
	// Dedup window for the cumulative counter (bounded; the display buffer has
	// its own dedup). The network feed broadcasts each block once, so clearing
	// when full only risks a recount in the rare overlap window.
	const seenHashesRef = useRef<Set<string>>(new Set())
	const [totalSeen, setTotalSeen] = useState(0)

	const cleanupConnection = useCallback(() => {
		if (firstFrameTimeoutRef.current) {
			clearTimeout(firstFrameTimeoutRef.current)
			firstFrameTimeoutRef.current = null
		}
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

		const scheduleReconnect = () => {
			reconnectAttemptRef.current += 1
			setStatus(reconnectAttemptRef.current >= WS_MAX_RECONNECT_ATTEMPTS ? 'offline' : 'connecting')
			reconnectTimeoutRef.current = setTimeout(connect, getReconnectDelay())
		}

		const connect = () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current)
				reconnectTimeoutRef.current = null
			}
			if (!isMounted || wsRef.current?.readyState === WebSocket.OPEN) return

			if (reconnectAttemptRef.current >= WS_MAX_RECONNECT_ATTEMPTS) {
				// Budget spent: keep the red LED but keep trying forever on a
				// fixed slow interval instead of going permanently dead.
				setStatus('offline')
				reconnectTimeoutRef.current = setTimeout(connect, WS_RETRY_FOREVER_DELAY)
				return
			}

			const preferred = preferredWsIndex
			preferredWsIndex = null
			const endpointIndex = preferred ?? getNextWsEndpointIndex()
			const endpoint = WS_NETWORK_ENDPOINTS[endpointIndex]
			const ws = new WebSocket(endpoint)

			const watchdog = setTimeout(() => {
				if (wsRef.current !== ws || ws.readyState === WebSocket.OPEN) return
				try {
					ws.close()
				} catch {
					// Engines that reject close() during CONNECTING: bypass the
					// socket entirely and run the reconnect path directly.
					ws.onopen = null
					ws.onmessage = null
					ws.onerror = null
					ws.onclose = null
					if (wsRef.current === ws) wsRef.current = null
					scheduleReconnect()
				}
			}, WS_CONNECT_WATCHDOG_MS)

			ws.onopen = () => {
				if (!isMounted || wsRef.current !== ws) return
				clearTimeout(watchdog)
				setStatus('live')
				reconnectAttemptRef.current = 0
				lastMessageAtRef.current = Date.now()
				// Dead-but-open relays (they open, then deliver nothing) would
				// otherwise sit on a green LED forever: fail over fast if no
				// valid confirmation arrives shortly after subscribing.
				firstFrameTimeoutRef.current = setTimeout(() => {
					if (wsRef.current !== ws || ws.readyState !== WebSocket.OPEN) return
					try {
						ws.close()
					} catch {
						// ignore
					}
				}, WS_FIRST_FRAME_MS)
				ws.send(JSON.stringify({ action: 'subscribe', topic: 'confirmation' }))
			}

			ws.onmessage = async (event) => {
				if (!isMounted || wsRef.current !== ws) return
				try {
					const text = event.data instanceof Blob ? await event.data.text() : (event.data as string)
					const data: unknown = JSON.parse(text)
					const validation = v.safeParse(NetworkConfirmationSchema, data)
					if (!validation.success) return

					if (firstFrameTimeoutRef.current) {
						clearTimeout(firstFrameTimeoutRef.current)
						firstFrameTimeoutRef.current = null
					}
					lastMessageAtRef.current = Date.now()
					// Delivery-verified warm start: only remember relays that
					// actually streamed a confirmation, never dead-open ones.
					try {
						localStorage.setItem(WS_PREFERRED_KEY, String(endpointIndex))
					} catch {
						// ignore
					}

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

					// Cumulative count: once per unique hash. The bounded dedup
					// window is reset when full; the network broadcasts each
					// block once, so a recount would only ever be a blip.
					const seen = seenHashesRef.current
					if (!seen.has(entry.hash)) {
						seen.add(entry.hash)
						if (seen.size > 2048) seen.clear()
						setTotalSeen((count) => count + 1)
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
				if (!isMounted || wsRef.current !== ws) return
				wsRef.current = null
				if (firstFrameTimeoutRef.current) {
					clearTimeout(firstFrameTimeoutRef.current)
					firstFrameTimeoutRef.current = null
				}
				scheduleReconnect()
			}

			wsRef.current = ws
		}

		const checkStale = () => {
			const ws = wsRef.current
			if (!ws || ws.readyState !== WebSocket.OPEN) return
			if (Date.now() - lastMessageAtRef.current < WS_STALE_AFTER_MS) return
			// Zombie socket: OPEN but silent. Closing it fires onclose, which
			// runs the reconnect path against the next endpoint.
			try {
				ws.close()
			} catch {
				// ignore
			}
		}

		const onVisibilityChange = () => {
			if (document.visibilityState !== 'visible') return
			const ws = wsRef.current
			if (!ws || ws.readyState === WebSocket.OPEN) return
			// A handshake still in flight would be orphaned by connect(): close
			// it first (its onclose will see the replaced ref and back off).
			if (ws.readyState === WebSocket.CONNECTING) {
				try {
					ws.close()
				} catch {
					// ignore
				}
			}
			// Background tabs throttle timers down to ~1/min: don't wait for
			// the reconnect timer, retry now with a fresh budget.
			reconnectAttemptRef.current = 0
			setStatus('connecting')
			connect()
		}

		connect()
		const staleInterval = setInterval(checkStale, WS_STALE_CHECK_INTERVAL_MS)
		document.addEventListener('visibilitychange', onVisibilityChange)

		return () => {
			isMounted = false
			clearInterval(staleInterval)
			document.removeEventListener('visibilitychange', onVisibilityChange)
			cleanupConnection()
		}
	}, [cleanupConnection])

	return { confirmations, totalSeen, status }
}
