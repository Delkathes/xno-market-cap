import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Sparkles } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

import { getPartnerById, getPartnersWithPages } from '@/lib/partner-config'
import { getPartnerCopy } from '@/lib/partner-copy'
import { localePath, ogImage, ogLocale } from '@/lib/seo'

import { env } from '@/env'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HreflangLinks } from '@/components/hreflang-links'
import { ModernPageBackground } from '@/components/modern-page-background'

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

	const { locale, slug } = await params
	const partner = getPartnerById(slug)

	if (!partner) {
		return { title: 'Not Found' }
	}

	const copy = getPartnerCopy(partner, locale)
	const tp = await getTranslations({ locale, namespace: 'partners' })

	return {
		title: `${copy.title} | ${tp('partnerLabel')}`,
		description: copy.description,
		openGraph: {
			title: copy.title,
			description: copy.description,
			url: `/partners/${slug}`,
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath(`/partners/${slug}`, locale),
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

	const partner = getPartnerById(slug)

	if (!partner?.hasInternalPage) {
		notFound()
	}

	const copy = getPartnerCopy(partner, locale)
	const tc = await getTranslations({ locale, namespace: 'common' })
	const tp = await getTranslations({ locale, namespace: 'partners' })

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
		<main className="relative isolate container mx-auto px-4 py-8">
			<HreflangLinks path={`/partners/${slug}`} />
			<ModernPageBackground />

			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD structured data
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'Organization',
						name: copy.partnerName,
						description: copy.description,
						url: partner.externalUrl ?? `${env.NEXT_PUBLIC_SITE_URL}/partners/${slug}`,
						logo: partner.logoUrl ? `${env.NEXT_PUBLIC_SITE_URL}${partner.logoUrl}` : undefined,
					}),
				}}
			/>

			<div className="mx-auto max-w-3xl animate-fade-in-up">
				{/* Back link */}
				<Link
					href="/"
					className="-ml-2 mb-10 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					{tc('home')}
				</Link>

				{/* Header */}
				<div className="mb-10 rounded-md border bg-card p-5 sm:p-6">
					<div className="flex items-start gap-4">
						{partner.logoUrl && (
							<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted/30 p-2">
								<Image
									src={partner.logoUrl}
									alt={partner.partnerName}
									fill
									className="object-contain"
									unoptimized
								/>
							</div>
						)}
						<div className="min-w-0 flex-1">
							<div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
								<span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
									{partner.partnerName}
								</span>
								<Badge
									variant="outline"
									className="gap-1 border-primary/30 font-mono text-[10px] uppercase tracking-widest text-primary"
									asChild
								>
									<Link href={`/partners/info`}>
										<Sparkles className="h-3 w-3" />
										{tp('partnerLabel')}
									</Link>
								</Badge>
							</div>
							<h1 className="text-2xl font-bold tracking-tight text-balance">{copy.title}</h1>
							<p className="mt-2 text-sm text-muted-foreground">{copy.description}</p>
							{partner.externalUrl && (
								<Button
									asChild
									variant="link"
									className="mt-3 h-auto cursor-pointer p-0 font-mono text-[11px] uppercase tracking-widest text-[#209CE9]"
								>
									<a href={partner.externalUrl} target="_blank" rel="noopener noreferrer partner">
										{tp('visitPartner', { name: partner.partnerName })}
										<ExternalLink className="h-3.5 w-3.5 ml-2" />
									</a>
								</Button>
							)}
						</div>
					</div>
				</div>

				{/* MDX Content */}
				{MdxContent && (
					<article className="article-prose">
						<MdxContent />
					</article>
				)}
			</div>
		</main>
	)
}
