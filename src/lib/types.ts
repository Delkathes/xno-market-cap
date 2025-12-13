export interface CryptoData {
	id: string
	symbol: string
	name: string
	image: string
	current_price: number
	market_cap: number
	market_cap_rank: number
	price_change_percentage_24h: number | null
	total_volume: number
	circulating_supply?: number
	max_supply?: number | null
}

export interface MarketDataResponse {
	data: CryptoData[]
	eurRate: number
	gbpRate: number
	jpyRate: number
	chfRate: number
	cadRate: number
	audRate: number
}

export interface NanoBalanceResponse {
	balance: string
	pending?: string
	receivable?: string
}

export interface WebSocketConfirmation {
	topic: 'confirmation'
	time: string
	message: {
		account: string
		amount: string
		hash: string
		confirmation_type: string
		block: {
			type: string
			account: string
			previous: string
			representative: string
			balance: string
			link: string
			link_as_account: string
			signature: string
			work: string
			subtype: 'send' | 'receive' | 'change' | 'epoch'
		}
	}
}
