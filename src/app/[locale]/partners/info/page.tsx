import type { Metadata } from 'next'
import { Globe, ShieldCheck, Sparkles, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { PartnerForm } from '@/components/partner-form'

export const metadata: Metadata = {
	title: 'Partner With Us – Nano Market Cap',
	description:
		'Promote your business to thousands of Nano users. Learn about our partner spotlight program, pricing, and how to get started.',
	robots: 'index,follow',
}

export default function PartnerInfoPage() {
	return (
		<main className="container mx-auto py-12 px-4 max-w-5xl">
			{/* Background Effects */}
			<div className="fixed inset-0 z-0 pointer-events-none animate-in fade-in duration-500">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#9f9f9f2e_1px,transparent_1px),linear-gradient(to_bottom,#9f9f9f2e_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]  bg-size-[50px_50px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-125 bg-cyan-500/10 dark:bg-cyan-500/12.5 blur-[120px] rounded-full mix-blend-screen" />
				<div className="absolute bottom-0 right-0 w-200 h-150 bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen" />
			</div>
			{/* Hero Section */}
			<div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
				<Badge
					variant="outline"
					className="mb-4 text-green-600 border-green-400/20 bg-green-400/10 backdrop-blur-sm"
				>
					<Sparkles className="w-3 h-3 mr-1" /> Partner Program
				</Badge>
				<h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-green-600 to-emerald-400">
					Grow with Nano Market Cap
				</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
					Put your project in front of the most engaged Nano community. Reach thousands of daily users who
					live and breathe XNO.
				</p>
			</div>

			<div className="grid md:grid-cols-2 gap-12 items-start">
				{/* Left Column: Benefits & Details */}
				<div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
					{/* Benefits Grid */}
					<div className="grid gap-6">
						<BenefitItem
							icon={Globe}
							title="Global Reach"
							description="Your brand displayed on our high-traffic homepage and dedicated partner page."
						/>
						<BenefitItem
							icon={Zap}
							title="Instant Setup"
							description="Go live in less than 24 hours. Simple XNO payment, no contracts."
						/>
						<BenefitItem
							icon={ShieldCheck}
							title="Trust & Authority"
							description="Align your brand with a trusted resource in the Nano ecosystem."
						/>
					</div>

					{/* Stats/Social Proof (Mockup style) */}
					<div className="p-6 bg-muted/50 rounded-xl border border-border/50">
						<h3 className="font-semibold text-lg mb-4">Why Partner?</h3>
						<div className="grid grid-cols-2 gap-4 text-center">
							<div className="p-4 bg-background rounded-lg shadow-sm">
								<div className="text-2xl font-bold text-primary">5k+</div>
								<div className="text-xs text-muted-foreground uppercase tracking-wider">
									Mo. Visitors
								</div>
							</div>
							<div className="p-4 bg-background rounded-lg shadow-sm">
								<div className="text-2xl font-bold text-primary">100%</div>
								<div className="text-xs text-muted-foreground uppercase tracking-wider">Nano Focus</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column: Form */}
				<div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
					<PartnerForm />
					<p className="mt-4 text-center text-sm text-muted-foreground">
						Prefer email? Contact us at{' '}
						<a
							href="mailto:partners@xnomarketcap.com"
							className="hover:text-foreground underline underline-offset-4"
						>
							partners@xnomarketcap.com
						</a>
					</p>
				</div>
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
