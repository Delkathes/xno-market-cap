// Nanswap API Types

export interface NanswapCurrency {
	ticker: string
	name: string
	image: string
	feeless: boolean
	network?: string
}

export interface NanswapCurrencies {
	[key: string]: NanswapCurrency
}

export interface NanswapEstimate {
	from: string
	to: string
	amountFrom: number
	amountTo: number
}

export interface NanswapLimits {
	from: string
	to: string
	min: number
	max: number
}

export interface NanswapCreateOrderRequest {
	from: string
	to: string
	amount: number
	toAddress: string
	extraId?: string
}

export interface NanswapOrder {
	id: string
	from: string
	to: string
	expectedAmountFrom: number
	expectedAmountTo: number
	payinAddress: string
	payoutAddress: string
	fromAmount?: number
	toAmount?: number
	status?: 'waiting' | 'confirming' | 'exchanging' | 'sending' | 'completed' | 'failed' | 'refunded' | 'expired'
	payinHash?: string
	payoutHash?: string
}
