import { fetchWithTimeout } from './fetch-with-timeout'
import type {
	NanswapCreateOrderRequest,
	NanswapCurrencies,
	NanswapEstimate,
	NanswapLimits,
	NanswapOrder,
} from './nanswap-types'

const NANSWAP_API_BASE = 'https://api.nanswap.com/v1'

const defaultHeaders = {
	Accept: 'application/json',
}

const WHITELISTED_CURRENCIES = new Set([
	// Feeless coins
	'XNO',
	'BAN',
	'NANUSD',
	'XDG',
	'ANA',
	'XRO',
	// Popular coins
	'BTC',
	'ETH',
	'BCH',
	'DASH',
	'ARK',
	'ASTR',
	'SOL',
	'DOT',
	'RVN',
	'XMR',
	'XRP',
	'XLM',
])

export async function getAllCurrencies(): Promise<NanswapCurrencies> {
	const response = await fetchWithTimeout(`${NANSWAP_API_BASE}/all-currencies`, {
		headers: defaultHeaders,
	})

	if (!response.ok) {
		throw new Error(`Failed to fetch currencies: ${response.status}`)
	}

	const currencies: NanswapCurrencies = await response.json()

	const filteredCurrencies: NanswapCurrencies = {}

	for (const [ticker, data] of Object.entries(currencies)) {
		if (WHITELISTED_CURRENCIES.has(ticker)) {
			filteredCurrencies[ticker] = data
		}
	}

	return filteredCurrencies
}

export async function getEstimate(from: string, to: string, amount: number): Promise<NanswapEstimate> {
	const params = new URLSearchParams({
		from,
		to,
		amount: amount.toString(),
	})

	const response = await fetchWithTimeout(`${NANSWAP_API_BASE}/get-estimate?${params}`, {
		headers: defaultHeaders,
	})

	if (!response.ok) {
		throw new Error(`Failed to get estimate: ${response.status}`)
	}

	return response.json()
}

export async function getEstimateReverse(from: string, to: string, amount: number): Promise<NanswapEstimate> {
	const params = new URLSearchParams({
		from,
		to,
		amount: amount.toString(),
	})

	const response = await fetchWithTimeout(`${NANSWAP_API_BASE}/get-estimate-reverse?${params}`, {
		headers: defaultHeaders,
	})

	if (!response.ok) {
		throw new Error(`Failed to get reverse estimate: ${response.status}`)
	}

	return response.json()
}

export async function getLimits(from: string, to: string): Promise<NanswapLimits> {
	const params = new URLSearchParams({ from, to })

	const response = await fetchWithTimeout(`${NANSWAP_API_BASE}/get-limits?${params}`, {
		headers: defaultHeaders,
	})

	if (!response.ok) {
		throw new Error(`Failed to get limits: ${response.status}`)
	}

	return response.json()
}

export async function createOrder(orderData: NanswapCreateOrderRequest, apiKey: string): Promise<NanswapOrder> {
	const response = await fetchWithTimeout(`${NANSWAP_API_BASE}/create-order`, {
		method: 'POST',
		headers: {
			...defaultHeaders,
			'Content-Type': 'application/json',
			'nanswap-api-key': apiKey,
		},
		body: JSON.stringify(orderData),
	})

	if (!response.ok) {
		throw new Error(`Failed to create order: ${response.status}`)
	}

	return response.json()
}

export async function getOrder(id: string): Promise<NanswapOrder> {
	const params = new URLSearchParams({ id })

	const response = await fetchWithTimeout(`${NANSWAP_API_BASE}/get-order?${params}`, {
		headers: defaultHeaders,
	})

	if (!response.ok) {
		throw new Error(`Failed to get order: ${response.status}`)
	}

	return response.json()
}
