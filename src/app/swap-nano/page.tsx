import type { Metadata } from 'next'
import Link from 'next/link'
import { Info } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { NanswapIframe } from '@/components/nanswap-widget'

export const metadata: Metadata = {
	title: 'Swap to Nano',
	description:
		'Convert altcoins to Nano (XNO) instantly using Nanswap. Swap Bitcoin, Ethereum, and 50+ cryptocurrencies to XNO with fast, feeless transactions.',
	keywords: [
		'swap to Nano',
		'convert to XNO',
		'Nanswap',
		'crypto swap',
		'exchange to Nano',
		'buy Nano',
		'BTC to XNO',
		'ETH to XNO',
	],
	openGraph: {
		title: 'Swap to Nano | NanoMarketCap',
		description: 'Convert altcoins to Nano (XNO) instantly using Nanswap. Swap 50+ cryptocurrencies to XNO.',
		url: '/swap-nano',
	},
	alternates: {
		canonical: '/swap-nano',
	},
}

export default function SwapNanoPage() {
	return (
		<main className="container mx-auto px-4 py-12">
			{/* Hero Section */}
			<div className="text-center mb-16">
				<Badge variant="outline" className="mb-4">
					Swap Crypto
				</Badge>
				<h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Swap to Nano instantly</h1>
				<p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-2">
					Convert altcoins to Nano using a compatible swap provider.
				</p>
				<p className="text-muted-foreground max-w-2xl mx-auto mb-6">
					Nano transactions confirm in under a second, so you can use your funds immediately after swapping.
				</p>
				<Link href="/get-nano" className="text-primary hover:underline text-sm font-medium">
					Need a wallet first?
				</Link>
			</div>

			{/* Swap Section */}
			<div className="max-w-4xl mx-auto mb-16">
				<div className="text-center mb-8">
					<h2 className="text-2xl md:text-3xl font-bold mb-3">Swap with Nanswap</h2>
					<p className="text-muted-foreground max-w-xl mx-auto">
						Nanswap supports quick conversions from dozens of currencies to Nano (XNO). Enter the amount you
						want to swap, send your crypto, and receive Nano directly in your wallet.
					</p>
				</div>

				<NanswapIframe />
				{/* <NanswapWidget /> */}
			</div>

			{/* Disclaimer */}
			<Alert className="max-w-2xl mx-auto">
				<Info className="h-4 w-4" />
				<AlertDescription>
					Nanswap is a third-party service not affiliated with XNO Market Cap. Always verify addresses and do
					your own research before swapping.
				</AlertDescription>
			</Alert>
		</main>
	)
}
