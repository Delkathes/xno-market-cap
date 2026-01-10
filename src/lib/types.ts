export interface CryptoData {
	id: string
	symbol: string
	name: string
	image: string
	current_price: number
	market_cap: number
	market_cap_rank: number
	price_change_percentage_24h: number | null
	price_change_percentage_1h_in_currency?: number | null
	price_change_percentage_7d_in_currency?: number | null
	total_volume: number
	circulating_supply?: number
	max_supply?: number | null
}

export interface XnoPriceChangePerCurrency {
	usd: number
	eur: number
	gbp: number
	jpy: number
	chf: number
	cad: number
	aud: number
}

export interface MarketDataResponse {
	data: CryptoData[]
	eurRate: number
	gbpRate: number
	jpyRate: number
	chfRate: number
	cadRate: number
	audRate: number
	xnoPriceChange1h: XnoPriceChangePerCurrency
	xnoPriceChange24h: XnoPriceChangePerCurrency
	xnoPriceChange7d: XnoPriceChangePerCurrency
	xnoData: CryptoData
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

// =============================================================================
// PRICE CHART TYPES
// =============================================================================

export type ChartTimeRange = '1' | '7' | '30' | '90' | '365'

// Lowercase fiat currency codes for CoinGecko API
export type FiatCurrencyCode = 'usd' | 'eur' | 'gbp' | 'jpy' | 'chf' | 'cad' | 'aud'

export interface PriceChartPoint {
	timestamp: number
	price: number
	priceInXNO: number
	marketCap: number
	volume: number
}

export interface PriceChartResponse {
	coinId: string
	prices: PriceChartPoint[]
	timeRange: ChartTimeRange
	vsCurrency?: FiatCurrencyCode // Only set when fetching XNO vs fiat
}
