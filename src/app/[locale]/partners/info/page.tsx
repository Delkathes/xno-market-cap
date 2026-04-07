import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Globe, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Appear } from '@/components/ui/appear'
import { Badge } from '@/components/ui/badge'
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
	setRequestLocale(locale)
	const t = await getTranslations({ locale, namespace: 'partners' })

	return (
		<main className="container mx-auto py-12 px-4 max-w-5xl">
			{/* Background Effects */}
			<div className="fixed inset-0 z-0 pointer-events-none">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#9f9f9f2e_1px,transparent_1px),linear-gradient(to_bottom,#9f9f9f2e_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]  bg-size-[50px_50px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-125 bg-cyan-500/10 dark:bg-cyan-500/12.5 blur-[120px] rounded-full mix-blend-screen" />
				<div className="absolute bottom-0 right-0 w-200 h-150 bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen" />
			</div>
			{/* Hero Section */}
			<Appear className="text-center mb-16 space-y-4" translateY={16} duration={700} threshold={0}>
				<Badge
					variant="outline"
					className="mb-4 text-green-600 border-green-400/20 bg-green-400/10 backdrop-blur-sm"
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
					<div className="grid gap-6">
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

					{/* Stats/Social Proof (Mockup style) */}
					<div className="p-6 bg-muted/50 rounded-xl border border-border/50">
						<h3 className="font-semibold text-lg mb-4">{t('stats.title')}</h3>
						<div className="grid grid-cols-2 gap-4 text-center">
							<div className="p-4 bg-background rounded-lg shadow-sm">
								<div className="text-2xl font-bold text-primary">{t('stats.visitors.value')}</div>
								<div className="text-xs text-muted-foreground uppercase tracking-wider">
									{t('stats.visitors.label')}
								</div>
							</div>
							<div className="p-4 bg-background rounded-lg shadow-sm">
								<div className="text-2xl font-bold text-primary">{t('stats.focus.value')}</div>
								<div className="text-xs text-muted-foreground uppercase tracking-wider">
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
		<div className="flex gap-4 p-4 rounded-lg bg-accent/10 dark:bg-accent/10 backdrop-blur-sm transition-colors">
			<div className="shrink-0">
				<div className="p-2 bg-primary/10 rounded-full text-primary">
					<Icon className="w-6 h-6" />
				</div>
			</div>
			<div>
				<h3 className="font-semibold text-foreground mb-1">{title}</h3>
				<p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
			</div>
		</div>
	)
}
