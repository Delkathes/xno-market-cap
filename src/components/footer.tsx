import { Github, Heart, Twitter } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { cn } from '@/lib/utils'

const footerLinks = {
	explore: [
		{ href: '/', labelKey: 'market' },
		{ href: '/dominance', labelKey: 'dominance' },
		{ href: '/parity', labelKey: 'parity' },
		{ href: '/speculation', labelKey: 'speculation' },
	],
	resources: [
		{ href: '/get-nano', labelKey: 'getNano' },
		{ href: '/swap-nano', labelKey: 'swapNano' },
		{ href: '/calculators', labelKey: 'calculators' },
	],
	external: [
		{ href: 'https://nano.org', labelKey: 'nanoOrg', external: true },
		{ href: 'https://docs.nano.org', labelKey: 'docs', external: true },
		{ href: 'https://hub.nano.org', labelKey: 'hub', external: true },
	],
}

const socialLinks = [
	{ href: 'https://github.com/nano-community', icon: Github, label: 'GitHub' },
	{ href: 'https://twitter.com/nano', icon: Twitter, label: 'Twitter' },
]

export async function Footer({ locale }: { locale: string }) {
	const t = await getTranslations({ locale, namespace: 'footer' })

	return (
		<footer className="border-t border-border bg-card mt-auto">
			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
					{/* Brand */}
					<div className="col-span-2 md:col-span-1">
						<Link href="/" className="inline-flex items-center font-bold text-xl mb-4">
							<span className="bg-linear-to-b from-cyan-400 to-blue-600 bg-clip-text text-transparent">
								Nano
							</span>
							<span>MarketCap</span>
						</Link>
						<p className="text-sm text-muted-foreground mb-4 max-w-xs">{t('description')}</p>
						<div className="flex items-center gap-3">
							{socialLinks.map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className={cn(
										'p-2 rounded-lg transition-colors',
										'text-muted-foreground hover:text-foreground',
										'hover:bg-muted',
									)}
									aria-label={social.label}
								>
									<social.icon className="h-5 w-5" />
								</a>
							))}
						</div>
					</div>

					{/* Explore Links */}
					<div>
						<h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
							{t('explore')}
						</h3>
						<ul className="space-y-3">
							{footerLinks.explore.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{t(`links.${link.labelKey}`)}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Resources Links */}
					<div>
						<h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
							{t('resources')}
						</h3>
						<ul className="space-y-3">
							{footerLinks.resources.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{t(`links.${link.labelKey}`)}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* External Links */}
					<div>
						<h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
							{t('community')}
						</h3>
						<ul className="space-y-3">
							{footerLinks.external.map((link) => (
								<li key={link.href}>
									<a
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{t(`links.${link.labelKey}`)}
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-12 pt-8 border-t border-border">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<p className="text-sm text-muted-foreground">© 2026 NanoMarketCap. {t('rights')}</p>
						<p className="text-sm text-muted-foreground flex items-center gap-1.5">
							{t('madeWith')} <Heart className="h-4 w-4 text-destructive fill-destructive" />{' '}
							{t('forNano')}
						</p>
					</div>
				</div>
			</div>
		</footer>
	)
}
