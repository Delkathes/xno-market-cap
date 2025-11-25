"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { TrendingUp, Moon, Sun, HelpCircle, RefreshCw, ArrowRightLeft, Wallet } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { AboutModal } from "@/components/about-modal"
import { DonationButton } from "@/components/donation-button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

const REFRESH_COOLDOWN = 60 // seconds

export function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [aboutOpen, setAboutOpen] = useState(false)
  const queryClient = useQueryClient()

  const [lastRefresh, setLastRefresh] = useState<number>(0)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  useEffect(() => {
    if (cooldownRemaining <= 0) return

    const timer = setInterval(() => {
      const remaining = Math.max(0, REFRESH_COOLDOWN - Math.floor((Date.now() - lastRefresh) / 1000))
      setCooldownRemaining(remaining)
    }, 1000)

    return () => clearInterval(timer)
  }, [lastRefresh, cooldownRemaining])

  const handleRefresh = useCallback(() => {
    if (cooldownRemaining > 0) return

    queryClient.invalidateQueries({ queryKey: ["market-data"] })
    setLastRefresh(Date.now())
    setCooldownRemaining(REFRESH_COOLDOWN)
  }, [queryClient, cooldownRemaining])

  const isRefreshDisabled = cooldownRemaining > 0

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span>{"NanoMarketCap"}</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center">
            <DonationButton />
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshDisabled}
              title={isRefreshDisabled ? `Refresh available in ${cooldownRemaining}s` : "Refresh market data"}
            >
              <RefreshCw className={cn("h-[1.2rem] w-[1.2rem] transition-all", isRefreshDisabled && "opacity-50")} />
              {isRefreshDisabled && (
                <span className="absolute text-[10px] font-mono font-bold">{cooldownRemaining}</span>
              )}
              <span className="sr-only">Refresh market data</span>
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setAboutOpen(true)} className="mr-2">
              <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">About this website</span>
            </Button>

            <Link
              href="/"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === "/"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              )}
            >
              Market Cap
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors bg-transparent",
                      pathname.startsWith("/swap-nano") || pathname.startsWith("/get-nano")
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                    )}
                  >
                    Nano
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-2 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/swap-nano"
                            className={cn(
                              "flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              pathname === "/swap-nano" && "bg-accent",
                            )}
                          >
                            <ArrowRightLeft className="h-5 w-5 text-primary" />
                            <div>
                              <div className="text-sm font-medium">Swap to Nano</div>
                              <p className="text-xs text-muted-foreground">Convert BTC, ETH or other crypto to XNO</p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/get-nano"
                            className={cn(
                              "flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              pathname === "/get-nano" && "bg-accent",
                            )}
                          >
                            <Wallet className="h-5 w-5 text-primary" />
                            <div>
                              <div className="text-sm font-medium">Get Nano</div>
                              <p className="text-xs text-muted-foreground">Choose a wallet and acquire XNO</p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link
              href="/dominance"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === "/dominance"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              )}
            >
              Dominance
            </Link>
            <Link
              href="/speculation"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === "/speculation"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              )}
            >
              Speculation
            </Link>
          </div>
        </nav>
      </div>

      <AboutModal open={aboutOpen} onOpenChange={setAboutOpen} />
    </header>
  )
}
