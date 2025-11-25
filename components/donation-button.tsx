"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Heart } from "lucide-react"
import { DonationModal } from "./donation-modal"
import { validateNanoBalanceResponse } from "@/lib/validation"
import { fetchWithTimeout } from "@/lib/fetch-with-timeout"
import { DONATION_GOAL_XNO } from "@/lib/constants"

const DONATION_WALLET = process.env.NEXT_PUBLIC_DONATION_WALLET || ""
const BALANCE_POLL_INTERVAL_MS = 60000
const REQUEST_TIMEOUT_MS = 10000

export function DonationButton() {
  const [open, setOpen] = useState(false)
  const [currentDonations, setCurrentDonations] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const progress = Math.min((currentDonations / DONATION_GOAL_XNO) * 100, 100)

  const fetchBalance = useCallback(async () => {
    if (!DONATION_WALLET) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetchWithTimeout(
        "https://rpc.nano.to",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "account_balance",
            account: DONATION_WALLET,
          }),
        },
        REQUEST_TIMEOUT_MS,
      )

      if (response.ok) {
        const data = await response.json()
        const validation = validateNanoBalanceResponse(data)
        if (validation.success && validation.balance) {
          const balanceXNO = Number.parseFloat(validation.balance) / 1e30
          setCurrentDonations(balanceXNO)
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.error("Balance fetch timed out")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalance()

    const interval = setInterval(fetchBalance, BALANCE_POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchBalance])

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
        donationGoal={DONATION_GOAL_XNO}
        onDonationReceived={fetchBalance}
      />
    </>
  )
}
