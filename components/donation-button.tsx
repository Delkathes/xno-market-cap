"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Heart } from "lucide-react"
import { DonationModal } from "./donation-modal"

const DONATION_GOAL = 2500
const DONATION_WALLET = process.env.NEXT_PUBLIC_DONATION_WALLET || ""

export function DonationButton() {
  const [open, setOpen] = useState(false)
  const [currentDonations, setCurrentDonations] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const progress = Math.min((currentDonations / DONATION_GOAL) * 100, 100)

  const fetchBalance = useCallback(async () => {
    if (!DONATION_WALLET) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("https://rpc.nano.to", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "account_balance",
          account: DONATION_WALLET,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Balance is in raw, convert to XNO (1 XNO = 10^30 raw)
        const balanceXNO = Number.parseFloat(data.balance) / 1e30
        setCurrentDonations(balanceXNO)
      }
    } catch (error) {
      // Fallback to 0 on error
      setCurrentDonations(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch current donation balance
  useEffect(() => {
    fetchBalance()

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [fetchBalance])

  // Don't render if no wallet is configured
  if (!DONATION_WALLET) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        className="flex items-center gap-2 h-9 px-3 bg-transparent"
        onClick={() => setOpen(true)}
      >
        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-xs font-medium leading-none">Donation Goal</span>
          <div className="flex items-center gap-2">
            <Progress value={progress} className="h-1.5 w-16" />
            <span className="text-[10px] text-muted-foreground font-mono leading-none">
              {isLoading ? "..." : `${progress.toFixed(0)}%`}
            </span>
          </div>
        </div>
      </Button>

      <DonationModal
        open={open}
        onOpenChange={setOpen}
        currentDonations={currentDonations}
        donationGoal={DONATION_GOAL}
        onDonationReceived={fetchBalance}
      />
    </>
  )
}
