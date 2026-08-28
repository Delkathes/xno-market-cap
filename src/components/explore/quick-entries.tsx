import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { getAccountBalances } from '@/lib/account-balances-service'

// Every entry RPC-verified (account_balance answered on at least one public
// relay) before being added to the explorer hub. Exchange wallets follow the
// aliases from nanexplorer's rich list.
const ACCOUNTS = [
	{
		address: 'nano_3x4ui45q1cw8hydmfdn4ec5ijsdqi4ryp14g4ayh71jcdkwmddrq7ca9xzn9',
		labelKey: 'binanceCold',
	},
	{
		address: 'nano_1wsf3wx3oj4qr4eyxq5ns4ffy4yrjfgczdo441786s3a5g4reyrnjf5tcfwb',
		labelKey: 'krakenCold',
	},
	{
		address: 'nano_1qiwzd7usjjsthnxe38nsz4jobyw35iiwkot6rpodsnfkeufyykmkrhqy4kp',
		labelKey: 'bitvavoCold',
	},
	{
		address: 'nano_3yej4c6s5ddwk8bq1o3945jgzx7axh94p813dmnq1aywh8ekufhfsgw68cbg',
		labelKey: 'binanceUsHot',
	},
] as const

// Historical dates: pre-2020 blocks carry no on-chain timestamp, so these are
// the documented network-history dates (genesis + first transactions: network
// launch, 4 Nov 2015; Binance cold opens: after the March 2018 Binance listing).
const BLOCKS = [
	{
		hash: '991cf190094c00f0b68e2e5f75f6bee95a2e0bd93ceaa4a6734db9f19b728948',
		labelKey: 'genesisBlock',
		meta: '2015-11-04 · ',
		amount: '340.28M XNO',
	},
	{
		hash: 'a170d51b94e00371ace76e35ac81dc9405d5d04d4cebc399aeace07ae05dd293',
		labelKey: 'firstSend',
		meta: '2015-11-04 · ',
		amount: '3.27M XNO',
	},
	{
		hash: '90d0c16ac92dd35814e84bfbcc739a039615d0a42a76ef44adaef1d99e9f8a35',
		labelKey: 'firstReceive',
		meta: '2015-11-04 · ',
		amount: '3.27M XNO',
	},
	{
		hash: '0ef9b910283d2d72aca1e40c6363633e59e0405b60fd6b98f722d2fd60a9f73b',
		labelKey: 'binanceColdOpens',
		meta: '2018-03 · ',
		amount: '888 XNO',
	},
] as const

function Chip({
	href,
	icon,
	label,
	value,
	meta,
	amount,
}: {
	href: string
	icon: ReactNode
	label: string
	value: string
	/** Muted placard prefix (dates etc.). */
	meta?: string
	/** XNO amount, rendered in the brand blue. */
	amount?: string
}) {
	return (
		<Link
			href={href}
			className="group flex min-w-0 items-center gap-3 rounded-sm border border-border bg-card/60 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-accent/40"
		>
			{icon}
			<span className="min-w-0 flex-1">
				<span className="block w-full truncate text-xs font-medium">{label}</span>
				<span className="block w-full truncate font-mono text-[10px] text-muted-foreground">{value}</span>
				{(meta || amount) && (
					<span className="block w-full truncate font-mono text-[10px] text-muted-foreground/60">
						{meta}
						{amount && <span className="text-primary">{amount}</span>}
					</span>
				)}
			</span>
		</Link>
	)
}

function shorten(hash: string): string {
	return `${hash.slice(0, 10)}…${hash.slice(-6)}`
}

function formatXno(xno: number, locale: string): string {
	if (xno >= 1_000_000) {
		return `${(xno / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 2 })}M`
	}
	if (xno >= 1) {
		return xno.toLocaleString(locale, { maximumFractionDigits: 2 })
	}
	if (xno > 0) {
		return xno.toLocaleString(locale, { maximumFractionDigits: 6 })
	}
	return '0'
}

/** Curated, verified entry points into the explorer: notable accounts and
 * network artifacts (genesis block, first send). One labeled group per
 * variant so the page can place them side by side with More Tools. */
export async function QuickEntries({ locale, variant }: { locale: string; variant: 'accounts' | 'artifacts' }) {
	const t = await getTranslations({ locale, namespace: 'explore' })

	const isAccounts = variant === 'accounts'

	// Live balances for the account placards (cached 5 min, like the page).
	const balances = isAccounts ? await getAccountBalances(ACCOUNTS.map((account) => account.address)) : undefined

	const entries = isAccounts
		? ACCOUNTS.map((account) => ({
				labelKey: account.labelKey,
				value: account.address,
				href: account.address,
				meta: undefined,
				amount: `${formatXno(balances?.[account.address] ?? 0, locale)} XNO`,
			}))
		: BLOCKS.map((block) => ({
				labelKey: block.labelKey,
				value: shorten(block.hash),
				href: block.hash,
				meta: block.meta,
				amount: block.amount,
			}))

	return (
		<div>
			<div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
				{t(isAccounts ? 'popularAccounts' : 'networkArtifacts')}
			</div>
			<div className="grid grid-cols-2 gap-2">
				{entries.map((entry) => (
					<Chip
						key={entry.href}
						href={isAccounts ? `/account/${entry.href}` : `/block/${entry.href}`}
						icon={
							isAccounts ? (
								<span className="flex h-6 w-6 flex-none items-center justify-center rounded-[3px] bg-primary/10 font-mono text-[10px] text-primary">
									Ӿ
								</span>
							) : (
								<span className="flex h-6 w-6 flex-none items-center justify-center rounded-[3px] bg-muted font-mono text-[10px] text-muted-foreground">
									#
								</span>
							)
						}
						label={t(entry.labelKey)}
						value={entry.value}
						meta={entry.meta}
						amount={entry.amount}
					/>
				))}
			</div>
		</div>
	)
}
