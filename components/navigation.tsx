"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { TrendingUp } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span>XNO Market</span>
          </Link>

          <div className="flex items-center gap-1">
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
          </div>
        </nav>
      </div>
    </header>
  )
}
