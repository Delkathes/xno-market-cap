import { cacheLife } from 'next/cache'
import { deriveAddress } from 'nanocurrency'
import * as v from 'valibot'

import { RPC_ENDPOINTS } from '@/lib/constants'
import { getDecentralizationData } from '@/lib/decentralization-service'
import { isTimeoutError } from '@/lib/fetch-with-timeout'
import { rawToXno } from '@/lib/nano-utils'
import { isErrorJson, nextRpcEndpoint, rpcCall } from '@/lib/rpc'
import {
	AccountHistoryResponseSchema,
	BlockInfoResponseSchema,
	NanoAccountInfoSchema,
	NanoBalanceSchema,
	NanoWeightSchema,
} from '@/lib/validation'

const PRINCIPAL_THRESHOLD = 0.001

export interface AccountData {
	address: string
	balanceXno: number
	pendingXno: number
	representative: string
	frontier: string
	openBlock: string
	blockCount: number
	weightXno: number
	onlineWeightXno: number
	shareOfOnline: number
	principal: boolean
	rank: number | null
	/** Whether the account has ever been opened (first receive). */
	hasActivity: boolean
	fetchedAt: number
}

export type AccountDataResult = { ok: true; data: AccountData } | { ok: false; reason: 'notFound' | 'rpcError' }

/**
 * Account profile from public Nano relays: balance, pending, representative,
 * open block, lifetime block count and voting weight. Cached 60s per address
 * (a node round-trip is ~200ms, an unbounded address space would hammer the
 * relays otherwise).
 */
export async function getAccountData(address: string): Promise<AccountDataResult> {
	'use cache'
	cacheLife({ revalidate: 60 })

	for (let attempt = 0; attempt < RPC_ENDPOINTS.length; attempt++) {
		const endpoint = nextRpcEndpoint()
		// Started before the relay calls and awaited after: the two are independent.
		const decPromise = getDecentralizationData().catch(() => null)

		try {
			const [balanceJson, infoJson, weightJson] = await Promise.all([
				rpcCall(endpoint, 'account_balance', { account: address }),
				rpcCall(endpoint, 'account_info', { account: address, representative: true }),
				rpcCall(endpoint, 'account_weight', { account: address }),
			])

			if (isErrorJson(balanceJson)) {
				return { ok: false, reason: 'notFound' }
			}

			const balance = v.safeParse(NanoBalanceSchema, balanceJson)
			const weight = v.safeParse(NanoWeightSchema, weightJson)
			if (!balance.success || !weight.success) {
				continue
			}

			const balanceXno = rawToXno(balance.output.balance)
			const pendingXno = rawToXno(balance.output.pending)
			const weightXno = rawToXno(weight.output.weight)

			// account_info errors for accounts that were never opened; the
			// balance action still answers 0 for them, so that's an empty
			// account, not an error.
			let representative = ''
			let frontier = ''
			let openBlock = ''
			let blockCount = 0
			if (!isErrorJson(infoJson)) {
				const info = v.safeParse(NanoAccountInfoSchema, infoJson)
				if (!info.success) continue
				representative = info.output.representative
				frontier = info.output.frontier
				openBlock = info.output.open_block
				blockCount = Number(info.output.block_count ?? '0')
			}

			const hasActivity = openBlock !== '' || balanceXno > 0 || blockCount > 0

			let onlineWeightXno = 0
			let shareOfOnline = 0
			let principal = false
			let rank: number | null = null
			const dec = await decPromise
			if (dec) {
				onlineWeightXno = dec.onlineWeightXno
				shareOfOnline = onlineWeightXno > 0 ? weightXno / onlineWeightXno : 0
				principal = shareOfOnline >= PRINCIPAL_THRESHOLD
				const rankIndex = dec.topReps.findIndex((rep) => rep.address === address)
				rank = rankIndex >= 0 ? rankIndex + 1 : null
			}

			return {
				ok: true,
				data: {
					address,
					balanceXno,
					pendingXno,
					representative,
					frontier,
					openBlock,
					blockCount,
					weightXno,
					onlineWeightXno,
					shareOfOnline,
					principal,
					rank,
					hasActivity,
					fetchedAt: Date.now(),
				},
			}
		} catch (error) {
			if (!isTimeoutError(error)) console.error(`ENDPOINT: ${endpoint} - Account data failed:`, error)
		}
	}

	return { ok: false, reason: 'rpcError' }
}

export interface AccountChainTimes {
	/** Unix timestamp of the open block (account creation), or null. */
	openedAt: number | null
	/** Unix timestamp of the frontier block (last activity), or null. */
	lastBlockAt: number | null
}

/**
 * Chain landmarks for the balance band: when the account was opened and when
 * it last moved. One block_info per landmark (a single-block account only
 * needs one call). Cached 300s, best effort.
 */
export async function getAccountChainTimes(openBlock: string, frontier: string): Promise<AccountChainTimes> {
	'use cache'
	cacheLife({ revalidate: 300 })

	if (!openBlock && !frontier) {
		return { openedAt: null, lastBlockAt: null }
	}

	const hashes = [...new Set([openBlock, frontier].filter(Boolean))]

	for (let attempt = 0; attempt < RPC_ENDPOINTS.length; attempt++) {
		const endpoint = nextRpcEndpoint()

		try {
			const results = await Promise.all(
				hashes.map(async (hash) => {
					try {
						const json = await rpcCall(endpoint, 'block_info', { hash })
						if (isErrorJson(json)) return { hash, ts: null }
						const parsed = v.safeParse(BlockInfoResponseSchema, json)
						return { hash, ts: parsed.success ? toTimestamp(parsed.output.local_timestamp) : null }
					} catch {
						return { hash, ts: null }
					}
				}),
			)

			const byHash = new Map(results.map((result) => [result.hash, result.ts]))
			return {
				openedAt: openBlock ? (byHash.get(openBlock) ?? null) : null,
				lastBlockAt: frontier ? (byHash.get(frontier) ?? null) : null,
			}
		} catch (error) {
			if (!isTimeoutError(error)) console.error(`ENDPOINT: ${endpoint} - Chain times failed:`, error)
		}
	}

	return { openedAt: null, lastBlockAt: null }
}

export interface AccountHistoryEntry {
	hash: string
	subtype: string
	/** Counterparty: recipient for sends, sender for receives. */
	counterparty: string
	amountXno: number
	balanceXno: number
	timestamp: number | null
	height: number
	confirmed: boolean
}

export interface AccountHistoryPage {
	address: string
	entries: AccountHistoryEntry[]
	hasMore: boolean
	offset: number
	fetchedAt: number
}

export interface BlockInfo {
	hash: string
	account: string
	representative: string
	linkAsAccount: string
	previous: string
	subtype: string
	amountXno: number
	balanceXno: number
	height: number
	timestamp: number | null
	confirmed: boolean
}

function toTimestamp(value: number | string | undefined): number | null {
	if (value === undefined || value === null) return null
	const parsed = typeof value === 'number' ? value : Number(value)
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function toConfirmed(value: boolean | 'true' | 'false' | undefined): boolean {
	return value === true || value === 'true'
}

/**
 * Paginated confirmed history for an account (newest first). Uses the
 * offset-based paging the node's account_history action supports; "has more"
 * is inferred from a full page, or the node's own `next` value when present.
 */
export async function getAccountHistory(address: string, count = 25, offset = 0): Promise<AccountHistoryPage | null> {
	'use cache'
	cacheLife({ revalidate: 60 })

	for (let attempt = 0; attempt < RPC_ENDPOINTS.length; attempt++) {
		const endpoint = nextRpcEndpoint()

		try {
			const json = await rpcCall(endpoint, 'account_history', { account: address, count, offset, raw: true })
			if (isErrorJson(json)) {
				return null
			}
			const parsed = v.safeParse(AccountHistoryResponseSchema, json)
			if (!parsed.success) {
				continue
			}

			const entries: AccountHistoryEntry[] = parsed.output.history.map((item) => {
				const subtype = item.subtype ?? item.type ?? ''
				let counterparty =
					subtype === 'send'
						? (item.link_as_account ?? '')
						: subtype === 'receive'
							? (item.account ?? '')
							: ''
				if (!counterparty && subtype === 'send' && item.link) {
					// Some relays omit link_as_account; for sends the link is
					// the raw recipient public key, so derive the address.
					try {
						counterparty = deriveAddress(item.link, { useNanoPrefix: true })
					} catch {
						counterparty = ''
					}
				}
				return {
					hash: item.hash,
					subtype,
					counterparty,
					amountXno: item.amount ? rawToXno(item.amount) : 0,
					balanceXno: item.balance ? rawToXno(item.balance) : 0,
					timestamp: toTimestamp(item.local_timestamp ?? item.timestamp),
					height: Number(item.height ?? '0'),
					confirmed: toConfirmed(item.confirmed),
				}
			})

			const next = parsed.output.next
			const nextOffset = next !== undefined ? Number(next) : offset + entries.length
			const hasMore =
				next !== undefined
					? nextOffset < Number.MAX_SAFE_INTEGER && entries.length >= count
					: entries.length >= count

			// Some relays answer a valid-but-sparse history (no counterparty
			// fields at all); those are useless for the ledger, try the next one.
			const missingCounterparty = entries.some(
				(entry) => (entry.subtype === 'send' || entry.subtype === 'receive') && entry.counterparty === '',
			)
			if (missingCounterparty) {
				continue
			}

			return {
				address,
				entries,
				hasMore,
				offset: nextOffset,
				fetchedAt: Date.now(),
			}
		} catch (error) {
			if (!isTimeoutError(error)) console.error(`ENDPOINT: ${endpoint} - Account history failed:`, error)
		}
	}

	return null
}

/** Single block details for the inline inspector panel. */
export async function getBlockInfo(hash: string): Promise<BlockInfo | null> {
	'use cache'
	cacheLife({ revalidate: 300 })

	for (let attempt = 0; attempt < RPC_ENDPOINTS.length; attempt++) {
		const endpoint = nextRpcEndpoint()

		try {
			const json = await rpcCall(endpoint, 'block_info', { hash })
			if (isErrorJson(json)) {
				return null
			}
			const parsed = v.safeParse(BlockInfoResponseSchema, json)
			if (!parsed.success) {
				continue
			}

			const out = parsed.output
			const contents =
				typeof out.contents === 'object' && out.contents !== null && !Array.isArray(out.contents)
					? (out.contents as Record<string, unknown>)
					: {}

			let linkAsAccount = String(contents.link_as_account ?? '')
			const subtype = out.subtype ?? String(contents.type ?? '')
			if (!linkAsAccount && contents.destination) {
				// Some relays name the recipient address "destination" on sends.
				linkAsAccount = String(contents.destination)
			}
			if (!linkAsAccount && subtype === 'send' && out.link) {
				// Relays that omit link_as_account still return the raw
				// recipient public key as the link for sends.
				try {
					linkAsAccount = deriveAddress(out.link, { useNanoPrefix: true })
				} catch {
					linkAsAccount = ''
				}
			}

			return {
				hash,
				account: out.block_account ?? String(contents.account ?? ''),
				representative: String(contents.representative ?? ''),
				linkAsAccount,
				previous: String(contents.previous ?? ''),
				subtype,
				amountXno: out.amount ? rawToXno(out.amount) : 0,
				balanceXno: out.balance ? rawToXno(out.balance) : 0,
				height: Number(out.height ?? '0'),
				timestamp: toTimestamp(out.local_timestamp),
				confirmed: toConfirmed(out.confirmed),
			}
		} catch (error) {
			if (!isTimeoutError(error)) console.error(`ENDPOINT: ${endpoint} - Block info failed:`, error)
		}
	}

	return null
}
