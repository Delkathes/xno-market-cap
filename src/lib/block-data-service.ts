import { cacheLife } from 'next/cache'
import { deriveAddress } from 'nanocurrency'
import * as v from 'valibot'

import { RPC_ENDPOINTS } from '@/lib/constants'
import { rawToXno } from '@/lib/nano-utils'
import { isErrorJson, nextRpcEndpoint, rpcCall } from '@/lib/rpc'
import { type BlockContentsSchema, BlockDetailsResponseSchema } from '@/lib/validation'

export interface BlockDetails {
	hash: string
	blockAccount: string
	/** contents.type: send | receive | change | open | epoch. */
	subtype: string
	confirmed: boolean
	height: number
	amountXno: number
	balanceXno: number
	localTimestamp: number | null
	/** Hash of the next block in the chain (absent for frontier blocks). */
	successor: string
	/** Hash of the previous block (absent for open blocks). */
	previous: string
	/** Source block hash for open/receive blocks (absent otherwise). */
	source: string
	/** Recipient address for sends. */
	linkAsAccount: string
	/** Sender address for receive/open blocks (best effort). */
	sourceAccount: string
	representative: string
	work: string
	signature: string
	/** Full block contents object, for the raw JSON view. */
	contentsRaw: Record<string, unknown>
	fetchedAt: number
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
 * Full block details from public Nano relays: one block_info (json_block:
 * true) returns the account, subtype, amount, balance, height, received
 * timestamp, confirmation state, successor, and the raw contents (previous,
 * source, representative, link, work, signature). Cached 300s per hash;
 * blocks are immutable once confirmed, and unconfirmed ones confirm on a
 * minute-ish scale.
 */
export async function getBlockDetails(hash: string): Promise<BlockDetails | null> {
	'use cache'
	cacheLife({ revalidate: 300 })

	for (let attempt = 0; attempt < RPC_ENDPOINTS.length; attempt++) {
		const endpoint = nextRpcEndpoint()

		try {
			const json = await rpcCall(endpoint, 'block_info', { hash, json_block: true })
			if (isErrorJson(json)) {
				return null
			}
			const parsed = v.safeParse(BlockDetailsResponseSchema, json)
			if (!parsed.success) {
				continue
			}

			const out = parsed.output
			const contents = out.contents ?? ({} as v.InferOutput<typeof BlockContentsSchema>)
			const subtype = contents.type ?? out.subtype ?? ''
			const link = (contents.link ?? out.link ?? '').toLowerCase()
			let linkAsAccount = contents.link_as_account ?? ''
			if (!linkAsAccount && contents.destination) {
				// Some relays name the recipient address "destination" on sends.
				linkAsAccount = contents.destination
			}
			if (!linkAsAccount && subtype === 'send' && link) {
				// Relays that omit link_as_account still return the raw
				// recipient public key as the link for sends.
				try {
					linkAsAccount = deriveAddress(link, { useNanoPrefix: true })
				} catch {
					linkAsAccount = ''
				}
			}

			const details: BlockDetails = {
				hash,
				blockAccount: out.block_account ?? contents.account ?? '',
				subtype,
				confirmed: toConfirmed(out.confirmed),
				height: Number(out.height ?? '0'),
				amountXno: rawToXno(out.amount_nano ?? out.amount ?? '0'),
				balanceXno: rawToXno(out.balance_nano ?? out.balance ?? '0'),
				localTimestamp: toTimestamp(out.local_timestamp),
				// Relays echo hashes in mixed case; canonicalize to lowercase
				// so chain links match the canonical route (mixed case would
				// 307-hop through the proxy).
				successor: (out.successor ?? '').toLowerCase(),
				previous: (contents.previous ?? '').toLowerCase(),
				source: (contents.source ?? '').toLowerCase(),
				linkAsAccount,
				sourceAccount: '',
				representative: contents.representative ?? '',
				work: contents.work ?? '',
				signature: contents.signature ?? '',
				contentsRaw: contents as unknown as Record<string, unknown>,
				fetchedAt: Date.now(),
			}

			// Receive/open: resolve the sender account from the source block
			// (best effort, one extra RPC round-trip).
			if ((subtype === 'receive' || subtype === 'open') && details.source) {
				try {
					const sourceJson = await rpcCall(endpoint, 'block_info', { hash: details.source })
					const sourceParsed = v.safeParse(BlockDetailsResponseSchema, sourceJson)
					if (!isErrorJson(sourceJson) && sourceParsed.success) {
						details.sourceAccount = sourceParsed.output.block_account ?? ''
					}
				} catch {
					// Best effort: the page renders without the sender address.
				}
			}

			return details
		} catch (error) {
			console.error(`ENDPOINT: ${endpoint} - Block details failed:`, error)
		}
	}

	return null
}
