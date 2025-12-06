import { atomWithStorage } from "jotai/utils"

export type FiatCurrency = "USD" | "EUR" | "GBP" | "JPY" | "CHF" | "CAD" | "AUD"

export const FIAT_CURRENCY_CONFIG: Record<FiatCurrency, { symbol: string; label: string }> = {
  USD: { symbol: "$", label: "US Dollar" },
  EUR: { symbol: "€", label: "Euro" },
  GBP: { symbol: "£", label: "British Pound" },
  JPY: { symbol: "¥", label: "Japanese Yen" },
  CHF: { symbol: "Fr", label: "Swiss Franc" },
  CAD: { symbol: "C$", label: "Canadian Dollar" },
  AUD: { symbol: "A$", label: "Australian Dollar" },
}

// Atoms with localStorage persistence
export const primaryFiatAtom = atomWithStorage<FiatCurrency>("xno-market-primary-fiat", "USD")
export const secondaryFiatAtom = atomWithStorage<FiatCurrency>("xno-market-secondary-fiat", "EUR")
export const cryptoCurrencyAtom = atomWithStorage<string>("xno-market-crypto", "bitcoin")

// Parity page: which fiat currencies to display (default: USD and EUR)
export const parityFiatCurrenciesAtom = atomWithStorage<FiatCurrency[]>(
  "xno-parity-fiat-currencies",
  ["USD", "EUR"]
)
