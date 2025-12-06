"use client"

import { memo, useMemo } from "react"
import { useAtom } from "jotai"
import { Settings } from "lucide-react"

import { cn } from "@/lib/utils"
import { parityFiatCurrenciesAtom, FIAT_CURRENCY_CONFIG, type FiatCurrency } from "@/lib/currency-atoms"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// =============================================================================
// SINGLE SOURCE OF TRUTH - Asset Data
// =============================================================================

type AssetType = "crypto" | "commodity" | "fiat"

interface AssetData {
  id: string
  label: string
  unit: string
  symbol: string
  supply: number
  type: AssetType
  color: {
    bg: string
    text: string
  }
  note: string
}

// All asset data in one place - ready to be replaced by API fetching
const ASSET_DATA: Record<string, AssetData> = {
  XNO: {
    id: "XNO",
    label: "Nano",
    unit: "XNO",
    symbol: "Ӿ",
    supply: 133_248_297,
    type: "crypto",
    color: { bg: "bg-[#209CE9]/20", text: "text-[#209CE9]" },
    note: "Fixed, fully distributed",
  },
  BTC: {
    id: "BTC",
    label: "Bitcoin",
    unit: "BTC",
    symbol: "₿",
    supply: 21_000_000,
    type: "crypto",
    color: { bg: "bg-[#F7931A]/20", text: "text-[#F7931A]" },
    note: "Maximum supply cap",
  },
  GOLD: {
    id: "GOLD",
    label: "Gold",
    unit: "KG",
    symbol: "Au",
    supply: 209_000_000,
    type: "commodity",
    color: { bg: "bg-[#FFD700]/20", text: "text-[#B8860B]" },
    note: "209,000 tonnes above ground",
  },
  USD: {
    id: "USD",
    label: "US Dollar",
    unit: "USD",
    symbol: "$",
    supply: 20_800_000_000_000,
    type: "fiat",
    color: { bg: "bg-green-500/20", text: "text-green-600" },
    note: "M2 Supply, infinite",
  },
  EUR: {
    id: "EUR",
    label: "Euro",
    unit: "EUR",
    symbol: "€",
    supply: 16_000_000_000_000,
    type: "fiat",
    color: { bg: "bg-blue-500/20", text: "text-blue-600" },
    note: "M2 Supply, infinite",
  },
  GBP: {
    id: "GBP",
    label: "British Pound",
    unit: "GBP",
    symbol: "£",
    supply: 3_200_000_000_000,
    type: "fiat",
    color: { bg: "bg-purple-500/20", text: "text-purple-600" },
    note: "M2 Supply, infinite",
  },
  JPY: {
    id: "JPY",
    label: "Japanese Yen",
    unit: "JPY",
    symbol: "¥",
    supply: 2_100_000_000_000_000,
    type: "fiat",
    color: { bg: "bg-red-500/20", text: "text-red-600" },
    note: "M2 Supply, infinite",
  },
  CHF: {
    id: "CHF",
    label: "Swiss Franc",
    unit: "CHF",
    symbol: "Fr",
    supply: 1_100_000_000_000,
    type: "fiat",
    color: { bg: "bg-red-600/20", text: "text-red-700" },
    note: "M2 Supply, infinite",
  },
  CAD: {
    id: "CAD",
    label: "Canadian Dollar",
    unit: "CAD",
    symbol: "C$",
    supply: 2_400_000_000_000,
    type: "fiat",
    color: { bg: "bg-red-500/20", text: "text-red-500" },
    note: "M2 Supply, infinite",
  },
  AUD: {
    id: "AUD",
    label: "Australian Dollar",
    unit: "AUD",
    symbol: "A$",
    supply: 2_800_000_000_000,
    type: "fiat",
    color: { bg: "bg-yellow-500/20", text: "text-yellow-600" },
    note: "M2 Supply, infinite",
  },
}

// =============================================================================
// DERIVED DATA - Computed from source of truth
// =============================================================================

type AssetId = keyof typeof ASSET_DATA

// Derive asset lists by type
const getAllAssetIds = (): AssetId[] => Object.keys(ASSET_DATA) as AssetId[]

const getAssetsByType = (type: AssetType): AssetId[] =>
  getAllAssetIds().filter((id) => ASSET_DATA[id].type === type)

const getCoreAssets = (): AssetId[] => [
  ...getAssetsByType("crypto"),
  ...getAssetsByType("commodity"),
]

const getFiatAssets = (): FiatCurrency[] => getAssetsByType("fiat") as FiatCurrency[]

// Static derivations (computed once)
const ALL_ASSETS = getAllAssetIds()
const CORE_ASSETS = getCoreAssets()
const FIAT_ASSETS = getFiatAssets()

// =============================================================================
// PURE FUNCTIONS - Data Transformation
// =============================================================================

// Calculate parity: 1 unit of A = (Supply of B) / (Supply of A)
const calculateParity = (fromId: AssetId, toId: AssetId): number => {
  const fromSupply = ASSET_DATA[fromId].supply
  const toSupply = ASSET_DATA[toId].supply
  return toSupply / fromSupply
}

// Calculate all parities for a given asset
const calculateAllParities = (fromId: AssetId, toIds: AssetId[]): Record<AssetId, number> =>
  Object.fromEntries(
    toIds.map((toId) => [toId, calculateParity(fromId, toId)])
  ) as Record<AssetId, number>

// Format supply for display
const formatSupply = (asset: AssetData): string => {
  const { supply, symbol, type } = asset
  
  if (type === "fiat") {
    const trillions = supply / 1_000_000_000_000
    return `${symbol}${trillions.toFixed(1)} Trillion`
  }
  
  if (type === "commodity") {
    return `${supply.toLocaleString()} kg`
  }
  
  return supply.toLocaleString()
}

// Format parity value for display
const formatParityValue = (value: number, asset: AssetData): string => {
  const { symbol, unit, id } = asset
  const isFiat = asset.type === "fiat"
  
  if (isFiat) {
    // JPY has much larger numbers
    if (id === "JPY") {
      if (value >= 1_000_000_000) return `${symbol}${(value / 1_000_000_000).toFixed(0)}B`
      if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(0)}M`
      if (value >= 1_000) return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      return `${symbol}${value.toFixed(0)}`
    }
    
    if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(0)}M`
    if (value >= 1_000) return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    if (value >= 1) return `${symbol}${value.toFixed(2)}`
    return `${symbol}${value.toFixed(8)}`
  }
  
  // Crypto and commodity
  if (value >= 1) {
    const decimals = value >= 100 ? 0 : value >= 10 ? 2 : 3
    return `${value.toFixed(decimals)} ${unit}`
  }
  
  return `${value.toFixed(4)} ${unit}`
}

// Format parity value for highlight cards (shorter format)
const formatHighlightValue = (value: number, asset: AssetData): string => {
  const { symbol, unit, type } = asset
  
  if (type === "fiat") {
    return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }
  
  const decimals = type === "commodity" ? 3 : 4
  return `${value.toFixed(decimals)} ${unit}`
}

// Get asset by ID with type safety
const getAsset = (id: AssetId): AssetData => ASSET_DATA[id]

// Filter assets by enabled fiats
const getFilteredAssets = (enabledFiats: FiatCurrency[]): AssetId[] => [
  ...CORE_ASSETS,
  ...enabledFiats,
]

// =============================================================================
// COMPONENTS
// =============================================================================

// Settings popover for fiat currency selection
function ParitySettingsPopover() {
  const [enabledFiats, setEnabledFiats] = useAtom(parityFiatCurrenciesAtom)

  const toggleFiat = (fiat: FiatCurrency) => {
    setEnabledFiats((current) => {
      if (current.includes(fiat)) {
        // Don't allow removing all fiats
        return current.length > 1 ? current.filter((f) => f !== fiat) : current
      }
      return [...current, fiat]
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Fiat currency settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Fiat Currencies</h4>
            <p className="text-sm text-muted-foreground">Select which currencies to display</p>
          </div>
          <div className="grid gap-2">
            {FIAT_ASSETS.map((fiat) => {
              const asset = getAsset(fiat)
              const isEnabled = enabledFiats.includes(fiat)
              return (
                <Button
                  key={fiat}
                  variant={isEnabled ? "default" : "outline"}
                  size="sm"
                  className="justify-start"
                  onClick={() => toggleFiat(fiat)}
                >
                  <span className="w-8">{asset.symbol}</span>
                  {asset.label}
                </Button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Hook to get filtered assets based on enabled fiats
function useFilteredAssets(): AssetId[] {
  const [enabledFiats] = useAtom(parityFiatCurrenciesAtom)
  return useMemo(() => getFilteredAssets(enabledFiats), [enabledFiats])
}

// Table row component
interface ParityRowProps {
  assetId: AssetId
  targetAssets: AssetId[]
}

const ParityRow = memo(function ParityRow({ assetId, targetAssets }: ParityRowProps) {
  const asset = getAsset(assetId)
  const isXNO = assetId === "XNO"
  
  const parities = useMemo(
    () => calculateAllParities(assetId, targetAssets),
    [assetId, targetAssets]
  )
  
  return (
    <tr className={cn(
      "border-b border-border hover:bg-muted/50 transition-colors",
      isXNO && "bg-primary/5"
    )}>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
            asset.color.bg,
            asset.color.text
          )}>
            {asset.symbol}
          </div>
          <div>
            <p className="font-semibold">{asset.label}</p>
            <p className="text-xs text-muted-foreground">1 {asset.unit}</p>
          </div>
        </div>
      </td>
      {targetAssets.map((targetId) => {
        const targetAsset = getAsset(targetId)
        const isSelf = assetId === targetId
        const value = parities[targetId]
        
        return (
          <td 
            key={targetId} 
            className={cn(
              "p-4 text-right font-mono text-sm",
              isSelf ? "text-muted-foreground" : targetAsset.color.text
            )}
          >
            {isSelf ? "1" : formatParityValue(value, targetAsset)}
          </td>
        )
      })}
      <td className="p-4 text-right font-mono text-primary">{formatSupply(asset)}</td>
      <td className="p-4 text-muted-foreground text-sm hidden md:table-cell">{asset.note}</td>
    </tr>
  )
})

// Main parity table
export function ParityTable() {
  const filteredAssets = useFilteredAssets()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Absolute Scarcity Parity</CardTitle>
        <CardDescription>
          Value based on total supply ratio: 1 unit of Asset A = (Total Supply of B) / (Total Supply of A)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-muted-foreground text-sm">
                <th className="text-left p-4 font-medium">Asset</th>
                {filteredAssets.map((assetId) => (
                  <th key={assetId} className="text-right p-4 font-medium">
                    {getAsset(assetId).label}
                  </th>
                ))}
                <th className="text-right p-4 font-medium">Total Supply</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Note</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((assetId) => (
                <ParityRow key={assetId} assetId={assetId} targetAssets={filteredAssets} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// XNO parity highlight cards
export function XNOParityHighlight() {
  const [enabledFiats] = useAtom(parityFiatCurrenciesAtom)
  
  const displayAssets = useMemo(
    () => getFilteredAssets(enabledFiats),
    [enabledFiats]
  )
  
  const parities = useMemo(
    () => calculateAllParities("XNO", displayAssets),
    [displayAssets]
  )

  // Determine grid columns based on number of items
  const totalItems = displayAssets.length
  const gridClass = totalItems <= 5 
    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" 
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"

  return (
    <section>
      <div className={cn("grid gap-3", gridClass)}>
        {displayAssets.map((assetId) => {
          const asset = getAsset(assetId)
          const isXNO = assetId === "XNO"
          const value = parities[assetId]
          
          return (
            <div 
              key={assetId}
              className={cn(
                "p-4 rounded-lg border",
                isXNO 
                  ? "bg-[#209CE9]/10 border-[#209CE9]/30" 
                  : "bg-background/50 border-border"
              )}
            >
              <p className="text-sm text-muted-foreground mb-1">{asset.label}</p>
              <p className={cn("text-xl font-bold font-mono", asset.color.text)}>
                {isXNO ? "1 XNO" : formatHighlightValue(value, asset)}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export { ParitySettingsPopover }
