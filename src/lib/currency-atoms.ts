import { atomWithStorage } from 'jotai/utils'

import { CRYPTO_IDS, FiatCurrency } from './constants'

// Atoms with localStorage persistence
export const primaryFiatAtom = atomWithStorage<FiatCurrency>('xno-market-primary-fiat', FiatCurrency.USD)
export const secondaryFiatAtom = atomWithStorage<FiatCurrency>('xno-market-secondary-fiat', FiatCurrency.EUR)
export const cryptoCurrencyAtom = atomWithStorage<string>('xno-market-crypto', CRYPTO_IDS.BITCOIN)

// Parity page: which fiat currencies to display (default: USD and EUR)
export const parityFiatCurrenciesAtom = atomWithStorage<FiatCurrency[]>('xno-parity-fiat-currencies', [
	FiatCurrency.USD,
	FiatCurrency.EUR,
])
