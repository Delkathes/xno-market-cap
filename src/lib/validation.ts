import * as v from 'valibot'

import { isValidBlockHash, isValidNanoAddress, isValidRawAmount, isValidSignature, isValidWork } from '@/lib/nano-utils'

export const DonationAmountSchema = v.pipe(
	v.number(),
	v.minValue(0.000001, 'Amount must be greater than 0'),
	v.maxValue(1000000, 'Amount cannot exceed 1,000,000 XNO'),
)

export function validateDonationAmount(amount: number): { success: boolean; error?: string } {
	const result = v.safeParse(DonationAmountSchema, amount)
	if (result.success) {
		return { success: true }
	}
	return { success: false, error: result.issues[0]?.message || 'Invalid amount' }
}

export const CryptoDataSchema = v.object({
	id: v.string(),
	symbol: v.string(),
	name: v.string(),
	image: v.string(),
	current_price: v.number(),
	market_cap: v.number(),
	market_cap_rank: v.number(),
	price_change_percentage_24h: v.nullable(v.number()),
	price_change_percentage_1h_in_currency: v.optional(v.nullable(v.number())),
	price_change_percentage_7d_in_currency: v.optional(v.nullable(v.number())),
	total_volume: v.number(),
	circulating_supply: v.optional(v.number()),
	max_supply: v.optional(v.nullable(v.number())),
	last_updated: v.optional(v.string()),
})

export const CryptoDataArraySchema = v.array(CryptoDataSchema)

export const NanoBalanceSchema = v.object({
	balance: v.string(),
	pending: v.string(),
})

export const NanoAccountInfoSchema = v.object({
	frontier: v.string(),
	open_block: v.string(),
	representative: v.string(),
})

export const NanoWeightSchema = v.object({
	weight: v.string(),
})

export const ExchangeRatesSchema = v.object({
	nano: v.optional(
		v.object({
			usd: v.optional(v.number()),
			eur: v.optional(v.number()),
			gbp: v.optional(v.number()),
			jpy: v.optional(v.number()),
			chf: v.optional(v.number()),
			cad: v.optional(v.number()),
			aud: v.optional(v.number()),
		}),
	),
})

export const XnoCoinDetailSchema = v.object({
	market_data: v.object({
		price_change_percentage_1h_in_currency: v.object({
			usd: v.optional(v.nullable(v.number())),
			eur: v.optional(v.nullable(v.number())),
			gbp: v.optional(v.nullable(v.number())),
			jpy: v.optional(v.nullable(v.number())),
			chf: v.optional(v.nullable(v.number())),
			cad: v.optional(v.nullable(v.number())),
			aud: v.optional(v.nullable(v.number())),
		}),
		price_change_percentage_24h_in_currency: v.object({
			usd: v.optional(v.nullable(v.number())),
			eur: v.optional(v.nullable(v.number())),
			gbp: v.optional(v.nullable(v.number())),
			jpy: v.optional(v.nullable(v.number())),
			chf: v.optional(v.nullable(v.number())),
			cad: v.optional(v.nullable(v.number())),
			aud: v.optional(v.nullable(v.number())),
		}),
		price_change_percentage_7d_in_currency: v.object({
			usd: v.optional(v.nullable(v.number())),
			eur: v.optional(v.nullable(v.number())),
			gbp: v.optional(v.nullable(v.number())),
			jpy: v.optional(v.nullable(v.number())),
			chf: v.optional(v.nullable(v.number())),
			cad: v.optional(v.nullable(v.number())),
			aud: v.optional(v.nullable(v.number())),
		}),
	}),
})

export const NanoBalanceResponseSchema = v.object({
	balance: v.pipe(v.string(), v.check(isValidRawAmount, 'Invalid raw balance amount')),
	pending: v.optional(v.pipe(v.string(), v.check(isValidRawAmount, 'Invalid raw pending amount'))),
	receivable: v.optional(v.pipe(v.string(), v.check(isValidRawAmount, 'Invalid raw receivable amount'))),
})

export function validateNanoBalanceResponse(data: unknown): { success: boolean; balance?: string; error?: string } {
	const result = v.safeParse(NanoBalanceResponseSchema, data)
	if (result.success) {
		return { success: true, balance: result.output.balance }
	}
	return { success: false, error: 'Invalid balance response' }
}

export const WebSocketConfirmationSchema = v.object({
	topic: v.literal('confirmation'),
	time: v.string(),
	message: v.object({
		account: v.pipe(v.string(), v.check(isValidNanoAddress, 'Invalid account address')),
		amount: v.pipe(v.string(), v.check(isValidRawAmount, 'Invalid raw amount')),
		hash: v.pipe(v.string(), v.check(isValidBlockHash, 'Invalid block hash')),
		confirmation_type: v.string(),
		block: v.object({
			type: v.string(),
			account: v.pipe(v.string(), v.check(isValidNanoAddress, 'Invalid block account address')),
			previous: v.string(), // Can be all zeros for open blocks
			representative: v.pipe(v.string(), v.check(isValidNanoAddress, 'Invalid representative address')),
			balance: v.pipe(v.string(), v.check(isValidRawAmount, 'Invalid block balance')),
			link: v.string(), // Can be hash or public key
			link_as_account: v.pipe(v.string(), v.check(isValidNanoAddress, 'Invalid link_as_account address')),
			signature: v.pipe(v.string(), v.check(isValidSignature, 'Invalid block signature')),
			work: v.pipe(v.string(), v.check(isValidWork, 'Invalid proof of work')),
			subtype: v.picklist(['send', 'receive', 'change', 'epoch']),
		}),
	}),
})

export function validateWebSocketConfirmation(data: unknown) {
	return v.safeParse(WebSocketConfirmationSchema, data)
}

// =============================================================================
// PRICE CHART VALIDATION
// =============================================================================

export const PriceChartRawSchema = v.object({
	prices: v.array(v.tuple([v.number(), v.number()])),
	market_caps: v.array(v.tuple([v.number(), v.number()])),
	total_volumes: v.array(v.tuple([v.number(), v.number()])),
})

export const ChartTimeRangeSchema = v.picklist(['1', '7', '30', '90', '365'])

export const FiatCurrencyCodeSchema = v.picklist(['usd', 'eur', 'gbp', 'jpy', 'chf', 'cad', 'aud'])
