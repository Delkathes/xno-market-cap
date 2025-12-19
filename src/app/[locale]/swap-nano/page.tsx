import type { Metadata } from 'next'
import { Info } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { NanswapIframe } from '@/components/nanswap-widget'

import { Link } from '@/i18n/navigation'

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

	return (
		<main className="container mx-auto px-4 py-12">
			{/* Hero Section */}
			<div className="text-center mb-16">
				<Badge variant="outline" className="mb-4">
					{t('badge')}
				</Badge>
				<h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{t('title')}</h1>
				<p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-2">{t('description1')}</p>
				<p className="text-muted-foreground max-w-2xl mx-auto mb-6">{t('description2')}</p>
				<Link href="/get-nano" className="text-primary hover:underline text-sm font-medium">
					{t('needWalletFirst')}
				</Link>
			</div>

			{/* Swap Section */}
			<div className="max-w-4xl mx-auto mb-16">
				<div className="text-center mb-8">
					<h2 className="text-2xl md:text-3xl font-bold mb-3">{t('swapWithNanswap')}</h2>
					<p className="text-muted-foreground max-w-xl mx-auto">{t('nanswapDescription')}</p>
				</div>

				<NanswapIframe />
			</div>

			{/* Disclaimer */}
			<Alert className="max-w-2xl mx-auto">
				<Info className="h-4 w-4" />
				<AlertDescription>{t('disclaimer')}</AlertDescription>
			</Alert>
		</main>
	)
}
