"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useMarketData } from "@/hooks/use-market-data"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { XNO_CIRCULATING_SUPPLY } from "@/lib/constants"

export function MarketOverview() {
  const { data, eurRate, isLoading } = useMarketData()
  const [showSatoshi, setShowSatoshi] = useState(false)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <div className="flex gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalMarketCap = data?.reduce((sum, crypto) => sum + crypto.market_cap, 0) || 0
  const xno = data?.find((c) => c.id === "nano")
  const btc = data?.find((c) => c.id === "bitcoin")
  const eth = data?.find((c) => c.id === "ethereum")

  const xnoMarketCapUSD = xno ? XNO_CIRCULATING_SUPPLY * xno.current_price : 0
  const xnoMarketCapEUR = xnoMarketCapUSD * eurRate
  const xnoMarketCapBTC = btc ? xnoMarketCapUSD / btc.current_price : 0

  const xnoPriceChangeUSD = xno?.price_change_percentage_24h || 0
  // EUR variation approximates USD variation (assumes EUR/USD rate relatively stable)
  const xnoPriceChangeEUR = xnoPriceChangeUSD
  // Sats variation is XNO performance relative to BTC
  const xnoPriceChangeSats = xno && btc ? xnoPriceChangeUSD - (btc.price_change_percentage_24h || 0) : 0

  const xnoPrice = xno?.current_price || 1
  const totalMarketCapInXNO = data?.reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0) || 0
  const xnoDominance = (XNO_CIRCULATING_SUPPLY / totalMarketCapInXNO) * 100
  const btcDominance = btc ? (btc.market_cap / xnoPrice / totalMarketCapInXNO) * 100 : 0
  const ethDominance = eth ? (eth.market_cap / xnoPrice / totalMarketCapInXNO) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Market Cap</p>
          <p className="text-2xl font-bold font-mono">{(XNO_CIRCULATING_SUPPLY / 1e6).toFixed(2)}M XNO</p>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-sm text-muted-foreground">
              $
              {xnoMarketCapUSD >= 1e9
                ? `${(xnoMarketCapUSD / 1e9).toFixed(2)}B`
                : `${(xnoMarketCapUSD / 1e6).toFixed(2)}M`}
            </p>
            <p className="text-sm text-muted-foreground">
              €
              {xnoMarketCapEUR >= 1e9
                ? `${(xnoMarketCapEUR / 1e9).toFixed(2)}B`
                : `${(xnoMarketCapEUR / 1e6).toFixed(2)}M`}
            </p>
            <p
              className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              onClick={() => setShowSatoshi(!showSatoshi)}
              title="Click to toggle between BTC and satoshi"
            >
              {showSatoshi ? `${(xnoMarketCapBTC * 1e8).toFixed(0)} sats` : `${xnoMarketCapBTC.toFixed(2)} BTC`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-1">XNO Price</p>
          <div className="text-2xl font-bold flex gap-6 font-mono">
            <span>${xno?.current_price.toFixed(2) || "0.0000"}</span>
            {xno && btc && (
              <>
                <span>€{(xno.current_price * eurRate).toFixed(2)}</span>
                <span>{((xno.current_price / btc.current_price) * 1e8).toFixed(0)}sats</span>
              </>
            )}
          </div>

          {xno && btc && (
            <div className="flex items-center gap-10 mt-2">
              {/* USD variation */}
              <div className="flex items-center gap-1">
                {xnoPriceChangeUSD >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-accent" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
                <span className={xnoPriceChangeUSD >= 0 ? "text-accent text-sm" : "text-destructive text-sm"}>
                  {xnoPriceChangeUSD.toFixed(2)}%
                </span>
              </div>

              {/* EUR variation */}
              <div className="flex items-center gap-1">
                {xnoPriceChangeEUR >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-accent" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
                <span className={xnoPriceChangeEUR >= 0 ? "text-accent text-sm" : "text-destructive text-sm"}>
                  {xnoPriceChangeEUR.toFixed(2)}%
                </span>
              </div>

              {/* Sats variation */}
              <div className="flex items-center gap-1">
                {xnoPriceChangeSats >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-accent" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
                <span className={xnoPriceChangeSats >= 0 ? "text-accent text-sm" : "text-destructive text-sm"}>
                  {xnoPriceChangeSats.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-1">XNO Dominance</p>
          <p className="text-2xl font-bold font-mono">{xnoDominance.toFixed(4)}%</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>BTC: {btcDominance.toFixed(2)}%</span>
            <span>ETH: {ethDominance.toFixed(2)}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
