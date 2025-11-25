"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AboutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>About NanoMarketCap</DialogTitle>
          <DialogDescription className="sr-only">Information about the XNO Market website</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">NanoMarketCap</strong> is a cryptocurrency market cap tracker that puts{" "}
            <strong className="text-primary">Nano (XNO)</strong> at the center of everything.
          </p>
          <p>
            Unlike traditional trackers that use fiat as a base currency, we flip the perspective: all prices, market caps, and dominance metrics are calculated relative to XNO.
          </p>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Key Features:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Market caps valued in XNO</li>
              <li>24h price changes relative to XNO performance</li>
              <li>XNO dominance tracking</li>
              <li>Speculation tool to see XNO price at different market caps</li>
            </ul>
          </div>
          <p className="text-xs border-t border-border pt-4 mt-4">
            Data is provided by CoinGecko API.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
