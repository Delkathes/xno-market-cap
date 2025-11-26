import { ArrowDown, Info } from "lucide-react"
import Link from "next/link"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export const dynamic = "force-static"

export const metadata = {
  title: "Swap to Nano | NanoMarketCap",
  description: "Convert altcoins to Nano (XNO) instantly using swap services.",
}

export default function SwapNanoPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge variant="outline" className="mb-4">
          Swap Crypto
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Swap to Nano instantly</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-2">
          Convert altcoins to Nano using a compatible swap provider.
        </p>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Nano transactions confirm in under a second, so you can use your funds immediately after swapping.
        </p>
        <Link href="/get-nano" className="text-primary hover:underline text-sm font-medium">
          Need a wallet first?
        </Link>
      </div>

      {/* Swap Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Swap with Nanswap</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Nanswap supports quick conversions from dozens of currencies to Nano (XNO). Enter the amount you want to
            swap, send your crypto, and receive Nano directly in your wallet.
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="font-medium">Swap coins</span>
            </div>

            {/* From Currency */}
            <div className="space-y-3 mb-2">
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 min-w-[100px]">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    ₿
                  </div>
                  <span className="font-medium">BTC</span>
                </div>
                <Input
                  type="number"
                  placeholder="0"
                  className="text-right border-0 bg-transparent text-lg font-mono focus-visible:ring-0"
                  defaultValue="0.01"
                />
              </div>

              <div className="flex justify-center">
                <div className="p-2 rounded-full border bg-background">
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* To Currency */}
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 min-w-[100px]">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    Ӿ
                  </div>
                  <span className="font-medium">XNO</span>
                </div>
                <Input
                  type="text"
                  placeholder="0"
                  className="text-right border-0 bg-transparent text-lg font-mono focus-visible:ring-0"
                  defaultValue="~6595.82"
                  readOnly
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-right mb-4">1 XNO ≈ 0.00000152 BTC</p>

            {/* Destination Address */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Destination Address</label>
                <Link href="/get-nano" className="text-xs text-primary hover:underline">
                  {"Don't have an address yet?"}
                </Link>
              </div>
              <Input placeholder="Your Nano address (nano_...)" />
            </div>

            <Button className="w-full" size="lg" asChild>
              <a href="https://nanswap.com" target="_blank" rel="noopener noreferrer">
                Swap on Nanswap
              </a>
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Powered by{" "}
              <a
                href="https://nanswap.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Nanswap.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Alert className="max-w-2xl mx-auto">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Nanswap is a third-party service not affiliated with NanoMarketCap. Always verify addresses and do your own
          research before swapping.
        </AlertDescription>
      </Alert>
    </main>
  )
}
