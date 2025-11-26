import Link from "next/link"
import { Smartphone, Monitor, Shield, Building2, ArrowRightLeft, Droplets, ExternalLink, Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = "force-static"

export const metadata = {
  title: "Get Nano & Choose a Wallet | NanoMarketCap",
  description: "Choose a Nano wallet and learn how to acquire XNO through exchanges, swaps, or faucets.",
}

export default function GetNanoPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-28">
        <Badge variant="outline" className="mb-6">
          Get Started
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Get Nano & choose a wallet</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-2">
          You need a Nano wallet to receive or send payments.
        </p>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Choose a wallet you trust, fund it with Nano, and you are ready to go.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/swap-nano">Swap to Nano</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://nano.org" target="_blank" rel="noopener noreferrer">
              Learn about Nano <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid md:grid-cols-2 gap-36 max-w-5xl mx-auto mb-16">
        {/* Step 1: Choose a wallet */}
        <div>
          <Badge className="mb-4">Step 1</Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Choose a wallet</h2>
          <p className="text-muted-foreground mb-8">
            Nano wallets exist on every platform. Pick one that matches how you want to manage your funds.
          </p>

          <div className="space-y-6">
            {/* Mobile */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Mobile</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Natrium, Nautilus, and Cake Wallet are fast mobile wallets for iOS and Android.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://natrium.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Natrium
                  </a>
                  <a
                    href="https://nautilus.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Nautilus
                  </a>
                  <a
                    href="https://cakewallet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Cake Wallet
                  </a>
                </div>
              </div>
            </div>

            {/* Desktop/Web */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Desktop/Web</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Manage funds in-browser with Nault for quick access from any device. Cake Wallet is also a great
                  option for desktop.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://nault.cc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Nault.cc
                  </a>
                  <a
                    href="https://cakewallet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Cake Wallet
                  </a>
                </div>
              </div>
            </div>

            {/* Hardware */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Hardware</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Use a Ledger Nano S/X with Nault for cold storage support.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://nault.cc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Ledger via Nault
                  </a>
                </div>
              </div>
            </div>
          </div>

          <a
            href="https://nano.org/get-nano"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-6"
          >
            View wallet directory <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Step 2: Get Nano */}
        <div>
          <Badge className="mb-4">Step 2</Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Get Nano</h2>
          <p className="text-muted-foreground mb-8">Once you have a wallet, acquire Nano to fund your account.</p>

          <div className="space-y-6">
            {/* Exchanges */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Exchanges</h3>
                <p className="text-sm text-muted-foreground">
                  Binance, Kraken, KuCoin, and other major exchanges list Nano (XNO).
                </p>
              </div>
            </div>

            {/* Swap Services */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Swap Services</h3>
                <p className="text-sm text-muted-foreground">
                  Convert altcoins to Nano using Nanswap, ChangeNOW, or SimpleSwap.
                </p>
              </div>
            </div>

            {/* Faucets */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Faucets</h3>
                <p className="text-sm text-muted-foreground">
                  Try Nano for free with community faucets that distribute small amounts.
                </p>
              </div>
            </div>
          </div>

          <a
            href="https://nano.org/get-nano"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-6"
          >
            Learn more about getting Nano <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* New to Nano Card */}
      <Card className="max-w-2xl mx-auto border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary mb-1">New to Nano?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Nano is a fast, feeless cryptocurrency perfect for micropayments. It is eco-friendly and transactions
                confirm in under a second.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://nano.org" target="_blank" rel="noopener noreferrer">
                  Learn about Nano <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
