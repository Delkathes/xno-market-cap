import type { Metadata } from 'next'
import { Info } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Appear } from '@/components/ui/appear'
import { Badge } from '@/components/ui/badge'
import { NanswapIframe } from '@/components/nanswap-widget'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.swapNano' })

	return {
		title: t('title'),
		description: t('description'),
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
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/swap-nano',
		},
		alternates: {
			canonical: '/swap-nano',
		},
	}
}

export default async function SwapNanoPage({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations('swapNano')
	const tDisclaimer = await getTranslations({ locale, namespace: 'legal.inlineDisclaimers' })

	return (
		<main className="container mx-auto px-4 py-12">
			{/* Background Effects */}
			<div className="fixed inset-0 z-0 pointer-events-none animate-in fade-in duration-500">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#9f9f9f2e_1px,transparent_1px),linear-gradient(to_bottom,#9f9f9f2e_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]  bg-size-[50px_50px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-125 bg-cyan-500/10 dark:bg-cyan-500/12.5 blur-[120px] rounded-full mix-blend-screen" />
				<div className="absolute bottom-0 right-0 w-200 h-150 bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen" />
			</div>
			{/* Hero Section */}
			<Appear className="text-center mb-16">
				<Badge variant="outline" className="mb-4">
					{t('badge')}
				</Badge>
				<h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{t('title')}</h1>
				<p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-2">{t('description1')}</p>
				<p className="text-muted-foreground max-w-2xl mx-auto mb-6">{t('description2')}</p>
				<Link href="/get-nano" className="text-primary hover:underline text-sm font-medium">
					{t('needWalletFirst')}
				</Link>
			</Appear>

			{/* Swap Section */}
			<Appear delay={100} className="max-w-4xl mx-auto mb-16">
				<div className="text-center mb-8">
					<h2 className="text-2xl md:text-3xl font-bold mb-3">{t('swapWithNanswap')}</h2>
					<p className="text-muted-foreground max-w-xl mx-auto">{t('nanswapDescription')}</p>
				</div>

				<NanswapIframe />
			</Appear>

			{/* Disclaimer */}
			<Appear delay={200}>
				<Alert className="max-w-2xl mx-auto">
					<Info className="h-4 w-4" />
					<AlertDescription>
						{t('disclaimer')}
						<span className="block mt-1 text-xs text-muted-foreground/70">
							{tDisclaimer('affiliateDisclosure')}
						</span>
					</AlertDescription>
				</Alert>
			</Appear>
		</main>
	)
}
