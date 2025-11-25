"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { TrendingUp, Moon, Sun, HelpCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { AboutModal } from "@/components/about-modal"
import { DonationButton } from "@/components/donation-button"

export function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [aboutOpen, setAboutOpen] = useState(false)

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
