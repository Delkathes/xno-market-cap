"use client"

import { useState, memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMarketData } from "@/hooks/use-market-data"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { XNO_CIRCULATING_SUPPLY } from "@/lib/constants"
import type { CryptoData } from "@/lib/types"

type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CHF" | "CAD" | "AUD"

const CURRENCY_CONFIG: Record<Currency, { symbol: string; label: string }> = {
  USD: { symbol: "$", label: "US Dollar" },
  EUR: { symbol: "€", label: "Euro" },
  GBP: { symbol: "£", label: "British Pound" },
  JPY: { symbol: "¥", label: "Japanese Yen" },
  CHF: { symbol: "Fr", label: "Swiss Franc" },
  CAD: { symbol: "C$", label: "Canadian Dollar" },
  AUD: { symbol: "A$", label: "Australian Dollar" },
}

interface SpeculationRowProps {
  crypto: CryptoData
  symbol: string
  formatMarketCap: (mcUSD: number) => string
  formatPrice: (priceInFiat: number) => string
  multiplier: number
  xnoPriceIf: number
}

const SpeculationRow = memo(function SpeculationRow({
  crypto,
  symbol,
  formatMarketCap,
  formatPrice,
  multiplier,
  xnoPriceIf,
}: SpeculationRowProps) {
  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="p-4">
        <span className="font-medium">{crypto.market_cap_rank}</span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Image
            src={crypto.image || "/placeholder.svg"}
            alt={crypto.name}
            width={32}
            height={32}
            className="rounded-full"
          />
          <div>
            <p className="font-semibold">{crypto.name}</p>
            <p className="text-sm text-muted-foreground uppercase">{crypto.symbol}</p>
          </div>
        </div>
      </td>
      <td className="p-4 text-right font-mono text-muted-foreground">{formatMarketCap(crypto.market_cap)}</td>
      <td className="p-4 text-right">
        <span className="font-mono font-bold text-primary">{formatPrice(xnoPriceIf)}</span>
      </td>
      <td className="p-4 text-right">
        <span
          className={cn(
            "font-mono font-medium px-2 py-1 rounded",
            multiplier >= 100
              ? "bg-accent/20 text-accent"
              : multiplier >= 10
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground",
          )}
        >
          {`${multiplier.toFixed(1)}×`}
        </span>
      </td>
    </tr>
  )
})

export function SpeculationTable() {
  const [currency, setCurrency] = useState<Currency>("USD")
  const { data, eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate, isLoading } = useMarketData()

  const getRate = (cur: Currency): number => {
    switch (cur) {
      case "EUR":
        return eurRate
      case "GBP":
        return gbpRate
      case "JPY":
        return jpyRate
      case "CHF":
        return chfRate
      case "CAD":
        return cadRate
      case "AUD":
        return audRate
      default:
        return 1
    }
  }

  const rate = getRate(currency)
  const { symbol } = CURRENCY_CONFIG[currency]

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const xno = data?.find((c) => c.id === "nano")
  const currentXnoPriceUSD = xno?.current_price || 0
  const currentXnoPrice = currentXnoPriceUSD * rate

  const otherCryptos = data?.filter((c) => c.id !== "nano").sort((a, b) => b.market_cap - a.market_cap)

  const formatPrice = (priceInFiat: number) => {
    if (currency === "JPY") {
      return priceInFiat >= 1000000
        ? `${symbol}${(priceInFiat / 1000000).toFixed(2)}M`
        : priceInFiat >= 1000
          ? `${symbol}${priceInFiat.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
          : `${symbol}${priceInFiat.toFixed(0)}`
    }
    return priceInFiat >= 1000
      ? `${symbol}${priceInFiat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : priceInFiat >= 1
        ? `${symbol}${priceInFiat.toFixed(2)}`
        : `${symbol}${priceInFiat.toFixed(4)}`
  }

  const formatMarketCap = (mcUSD: number) => {
    const mc = mcUSD * rate
    if (mc >= 1e12) return `${symbol}${(mc / 1e12).toFixed(2)}T`
    if (mc >= 1e9) return `${symbol}${(mc / 1e9).toFixed(2)}B`
    return `${symbol}${(mc / 1e6).toFixed(2)}M`
  }

  return (
    <Card className="relative">
      <div className="absolute -top-12 right-0">
        <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CURRENCY_CONFIG).map(([key, { symbol: sym, label }]) => (
              <SelectItem key={key} value={key}>
                {sym} {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-muted-foreground text-sm">
                <th className="text-left p-4 font-medium">#</th>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-right p-4 font-medium">Market Cap ({currency})</th>
                <th className="text-right p-4 font-medium">XNO Price If</th>
                <th className="text-right p-4 font-medium">Multiplier</th>
              </tr>
            </thead>
            <tbody>
              {otherCryptos?.map((crypto) => {
                const marketCapInFiat = crypto.market_cap * rate
                const xnoPriceIf = marketCapInFiat / XNO_CIRCULATING_SUPPLY
                const multiplier = currentXnoPrice > 0 ? xnoPriceIf / currentXnoPrice : 0

                return (
                  <SpeculationRow
                    key={crypto.id}
                    crypto={crypto}
                    symbol={symbol}
                    formatMarketCap={formatMarketCap}
                    formatPrice={formatPrice}
                    multiplier={multiplier}
                    xnoPriceIf={xnoPriceIf}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
