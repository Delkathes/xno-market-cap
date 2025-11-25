"use client"

import { useAtom } from "jotai"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  primaryFiatAtom,
  secondaryFiatAtom,
  cryptoCurrencyAtom,
  FIAT_CURRENCY_CONFIG,
  type FiatCurrency,
} from "@/lib/currency-atoms"
import type { CryptoData } from "@/lib/types"

interface CurrencySettingsPopoverProps {
  cryptoList?: CryptoData[]
}

export function CurrencySettingsPopover({ cryptoList }: CurrencySettingsPopoverProps) {
  const [primaryFiat, setPrimaryFiat] = useAtom(primaryFiatAtom)
  const [secondaryFiat, setSecondaryFiat] = useAtom(secondaryFiatAtom)
  const [cryptoCurrency, setCryptoCurrency] = useAtom(cryptoCurrencyAtom)

  // Filter out XNO from crypto list since it's always the base
  const availableCryptos = cryptoList?.filter((c) => c.id !== "nano") || []

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Currency settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Display Settings</h4>
            <p className="text-sm text-muted-foreground">Choose currencies to display</p>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="primary-fiat">Primary Fiat</Label>
              <Select value={primaryFiat} onValueChange={(v) => setPrimaryFiat(v as FiatCurrency)}>
                <SelectTrigger id="primary-fiat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FIAT_CURRENCY_CONFIG).map(([key, { symbol, label }]) => (
                    <SelectItem key={key} value={key}>
                      {symbol} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="secondary-fiat">Secondary Fiat</Label>
              <Select value={secondaryFiat} onValueChange={(v) => setSecondaryFiat(v as FiatCurrency)}>
                <SelectTrigger id="secondary-fiat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FIAT_CURRENCY_CONFIG).map(([key, { symbol, label }]) => (
                    <SelectItem key={key} value={key}>
                      {symbol} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="crypto-currency">Crypto Reference</Label>
              <Select value={cryptoCurrency} onValueChange={setCryptoCurrency}>
                <SelectTrigger id="crypto-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCryptos.map((crypto) => (
                    <SelectItem key={crypto.id} value={crypto.id}>
                      <span className="flex items-center gap-2">
                        <span className="uppercase text-xs text-muted-foreground">{crypto.symbol}</span>
                        <span>{crypto.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
