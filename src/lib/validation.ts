import * as v from 'valibot'

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
	total_volume: v.number(),
	circulating_supply: v.optional(v.number()),
	max_supply: v.optional(v.nullable(v.number())),
})

export const CryptoDataArraySchema = v.array(CryptoDataSchema)

export const ExchangeRatesSchema = v.object({
	usd: v.optional(
		v.object({
			eur: v.optional(v.number()),
			gbp: v.optional(v.number()),
			jpy: v.optional(v.number()),
			chf: v.optional(v.number()),
			cad: v.optional(v.number()),
			aud: v.optional(v.number()),
		}),
	),
})

export const NanoBalanceResponseSchema = v.object({
	balance: v.string(),
	pending: v.optional(v.string()),
	receivable: v.optional(v.string()),
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
		account: v.string(),
		amount: v.string(),
		hash: v.string(),
		confirmation_type: v.string(),
		block: v.object({
			type: v.string(),
			account: v.string(),
			previous: v.string(),
			representative: v.string(),
			balance: v.string(),
			link: v.string(),
			link_as_account: v.string(),
			signature: v.string(),
			work: v.string(),
			subtype: v.picklist(['send', 'receive', 'change', 'epoch']),
		}),
	}),
})

export function validateWebSocketConfirmation(data: unknown) {
	return v.safeParse(WebSocketConfirmationSchema, data)
}
