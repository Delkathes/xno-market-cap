import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Globe, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Appear } from '@/components/ui/appear'
import { Badge } from '@/components/ui/badge'
import { ModernPageBackground } from '@/components/modern-page-background'
import { PartnerForm } from '@/components/partner-form'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata' })

	return {
		title: t('partners.title'),
		description: t('partners.description'),
		robots: 'index,follow',
	}
}

export default async function PartnerInfoPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'partners' })

	return (
		<main className="relative isolate container mx-auto py-12 px-4 max-w-5xl">
			<ModernPageBackground />

			{/* Hero Section */}
			<Appear className="text-center mb-16 space-y-4" translateY={16} duration={700} threshold={0}>
				<Badge
					variant="outline"
					className="mb-4 font-mono text-[10px] uppercase tracking-widest text-green-600 border-green-400/20 bg-green-400/10 backdrop-blur-sm"
				>
					<Sparkles className="w-3 h-3 mr-1" /> {t('badge')}
				</Badge>
				<h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-green-600 to-emerald-400">
					{t('heroTitle')}
				</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('heroDescription')}</p>
			</Appear>

			<div className="grid md:grid-cols-2 gap-12 items-start">
				{/* Left Column: Benefits & Details */}
				<Appear className="space-y-10" delay={200} translateY={0} duration={700} threshold={0}>
					{/* Benefits Grid */}
					<div className="grid gap-3">
						<BenefitItem
							icon={Globe}
							title={t('benefits.globalReach.title')}
							description={t('benefits.globalReach.description')}
						/>
						<BenefitItem
							icon={Zap}
							title={t('benefits.instantSetup.title')}
							description={t('benefits.instantSetup.description')}
						/>
						<BenefitItem
							icon={ShieldCheck}
							title={t('benefits.trust.title')}
							description={t('benefits.trust.description')}
						/>
					</div>

					{/* Stats/Social Proof */}
					<div className="rounded-md border bg-card p-4">
						<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
							{t('stats.title')}
						</p>
						<div className="grid grid-cols-2 gap-2">
							<div className="rounded-md border border-border bg-muted/30 px-3 py-2.5 text-center">
								<div className="font-mono text-2xl font-bold tabular-nums text-primary">
									{t('stats.visitors.value')}
								</div>
								<div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
									{t('stats.visitors.label')}
								</div>
							</div>
							<div className="rounded-md border border-border bg-muted/30 px-3 py-2.5 text-center">
								<div className="font-mono text-2xl font-bold tabular-nums text-primary">
									{t('stats.focus.value')}
								</div>
								<div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
									{t('stats.focus.label')}
								</div>
							</div>
						</div>
					</div>
				</Appear>

				{/* Right Column: Form */}
				<Appear delay={300} translateY={16} duration={700} threshold={0}>
					<PartnerForm />
					<p className="mt-4 text-center text-sm text-muted-foreground">
						{t('contact.text')}{' '}
						<a
							href="mailto:partners@nanomarketcap.com"
							className="hover:text-foreground underline underline-offset-4"
						>
							{t('contact.email')}
						</a>
					</p>
				</Appear>
			</div>
		</main>
	)
}

function BenefitItem({
	icon: Icon,
	title,
	description,
}: {
	icon: React.ComponentType<{ className?: string }>
	title: string
	description: string
}) {
	return (
		<div className="flex gap-4 rounded-md border bg-card p-4 transition-colors hover:border-primary/40">
			<div className="shrink-0">
				<div className="grid h-9 w-9 place-items-center rounded-md border bg-primary/10 text-primary">
					<Icon className="h-4 w-4" />
				</div>
			</div>
			<div>
				<h3 className="font-semibold text-foreground mb-1">{title}</h3>
				<p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
			</div>
		</div>
	)
}
