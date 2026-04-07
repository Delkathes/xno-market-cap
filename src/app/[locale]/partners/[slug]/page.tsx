import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Sparkles } from 'lucide-react'
import { setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

import { getPartnerById, getPartnersWithPages } from '@/lib/partner-config'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Props = {
	params: Promise<{ locale: string; slug: string }>
}

export function generateStaticParams() {
	const partners = getPartnersWithPages()

	return routing.locales.flatMap((locale) => partners.map((partner) => ({ locale, slug: partner.id })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { slug } = await params
	const partner = getPartnerById(slug)

	if (!partner) {
		return { title: 'Not Found' }
	}

	return {
		title: `${partner.title} | Partner`,
		description: partner.description,
		openGraph: {
			title: partner.title,
			description: partner.description,
			url: `/partners/${slug}`,
		},
		alternates: {
			canonical: `/partners/${slug}`,
		},
		robots: {
			index: true,
			follow: true,
		},
	}
}

export default async function PartnerPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale, slug } = await params
	setRequestLocale(locale)

	const partner = getPartnerById(slug)

	if (!partner?.hasInternalPage) {
		notFound()
	}

	// Try to load MDX content for this partner
	let MdxContent: React.ComponentType | null = null
	try {
		const mdxModule = await import(`@content/partners/${locale}/${slug}.mdx`)
		MdxContent = mdxModule.default
	} catch {
		// Try fallback to English
		try {
			const mdxModule = await import(`@content/partners/en/${slug}.mdx`)
			MdxContent = mdxModule.default
		} catch {
			// No MDX content available
		}
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="max-w-3xl mx-auto">
				{/* Back link */}
				<Link
					href="/"
					className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to home
				</Link>

				{/* Header */}
				<div className="flex items-start gap-4 mb-16 mt-12">
					{partner.logoUrl && (
						<div className="shrink-0 relative h-16 w-16 overflow-hidden">
							<Image
								src={partner.logoUrl}
								alt={partner.partnerName}
								fill
								className="object-contain p-1"
							/>
						</div>
					)}
					<div className="flex-1 min-w-0 relative">
						{/* Partner badge */}
						<div className="flex items-center mb-1 absolute -top-5.5 gap-2">
							<p className="text-sm text-muted-foreground">{partner.partnerName}</p>
							<Badge variant="outline" className="gap-1 border-primary/30 text-xs text-primary" asChild>
								<Link href={`/partners/info`}>
									<Sparkles className="h-3 w-3" />
									Partner
								</Link>
							</Badge>
						</div>
						<h1 className="text-2xl font-bold mb-2">{partner.title}</h1>
						<p className="text-muted-foreground">{partner.description}</p>
						{/* External link if available */}
						{partner.externalUrl && (
							<Button asChild variant="link" className="mt-2 cursor-pointer">
								<a
									href={partner.externalUrl}
									target="_blank"
									rel="noopener noreferrer partner"
									className="px-0!"
								>
									Visit {partner.partnerName}
									<ExternalLink className="h-4 w-4 ml-2" />
								</a>
							</Button>
						)}
					</div>
				</div>

				{/* MDX Content */}
				{MdxContent && (
					<article className="prose prose-neutral dark:prose-invert max-w-none">
						<MdxContent />
					</article>
				)}
			</div>
		</main>
	)
}
