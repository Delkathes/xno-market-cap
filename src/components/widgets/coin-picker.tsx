'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface PickerCoin {
	symbol: string
	name: string
	marketCapRank: number
}

/**
 * Searchable multi-coin picker dropdown (the pattern from the account
 * explorer's compare bar): trigger button with a count, search input, and a
 * scrollable checkbox list. Selected symbols are toggled via onToggle.
 */
export function CoinPickerDropdown({
	coins,
	selected,
	onToggle,
	limit,
	searchPlaceholder,
	noMatch,
	triggerLabel,
	align = 'right',
}: {
	coins: PickerCoin[]
	selected: string[]
	onToggle: (symbol: string) => void
	limit: number
	searchPlaceholder: string
	noMatch: string
	triggerLabel: (count: number) => React.ReactNode
	align?: 'left' | 'right'
}) {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState('')

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		return coins.filter(
			(coin) => q === '' || coin.symbol.toLowerCase().includes(q) || coin.name.toLowerCase().includes(q),
		)
	}, [coins, query])

	return (
		<div className="relative">
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => setOpen((value) => !value)}
				disabled={selected.length >= limit}
				className="cursor-pointer"
				aria-expanded={open}
			>
				<Plus className="h-3.5 w-3.5" />
				{triggerLabel(selected.length)}
			</Button>
			{open && (
				<>
					<button
						type="button"
						aria-label="Close"
						className="fixed inset-0 z-30 cursor-default"
						onClick={() => setOpen(false)}
					/>
					<div
						className={cn(
							'absolute z-40 mt-2 w-72 overflow-hidden rounded-md border border-border bg-popover shadow-lg',
							align === 'right' ? 'right-0' : 'left-0',
						)}
					>
						<div className="border-b border-border p-2">
							<Input
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder={searchPlaceholder}
								className="h-8 font-mono text-xs"
								autoFocus
							/>
						</div>
						<ul className="max-h-64 overflow-y-auto">
							{filtered.length === 0 && (
								<li className="px-3 py-3 text-center text-xs text-muted-foreground">{noMatch}</li>
							)}
							{filtered.map((coin) => {
								const pinned = selected.includes(coin.symbol)
								return (
									<li key={coin.symbol}>
										<button
											type="button"
											onClick={() => onToggle(coin.symbol)}
											disabled={!pinned && selected.length >= limit}
											className={cn(
												'flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-40',
												pinned && 'bg-primary/5',
											)}
										>
											<span
												className={cn(
													'h-3.5 w-3.5 flex-none rounded-[3px] border',
													pinned ? 'border-primary bg-primary' : 'border-border',
												)}
												aria-hidden="true"
											>
												{pinned && (
													<span className="block text-[10px] leading-3 text-primary-foreground">
														✓
													</span>
												)}
											</span>
											<span className="w-14 flex-none font-mono text-xs font-semibold">
												{coin.symbol}
											</span>
											<span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
												{coin.name}
											</span>
											<span className="flex-none font-mono text-[10px] text-muted-foreground/60 tabular-nums">
												#{coin.marketCapRank}
											</span>
										</button>
									</li>
								)
							})}
						</ul>
					</div>
				</>
			)}
		</div>
	)
}
