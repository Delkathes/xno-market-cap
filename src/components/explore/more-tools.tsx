import { ArrowRightLeft, Fingerprint, Link2, Zap } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

const TOOLS = [
	{ href: '/tools/unit-converter', labelKey: 'toolUnitConverter', icon: ArrowRightLeft },
	{ href: '/tools/fee-comparison', labelKey: 'toolFeeComparison', icon: Zap },
	{ href: '/tools/address-tools', labelKey: 'toolAddressTools', icon: Fingerprint },
	{ href: '/tools/payment-links', labelKey: 'toolPaymentLinks', icon: Link2 },
] as const

/** Sidebar of compact deep links into the Tools section. */
export async function MoreTools({ locale }: { locale: string }) {
	const t = await getTranslations({ locale, namespace: 'explore' })
	const nav = await getTranslations({ locale, namespace: 'navigation' })

	return (
		<div>
			<div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
				{t('moreTools')}
			</div>
			<ul className="grid grid-cols-2 gap-2">
				{TOOLS.map((tool) => {
					const Icon = tool.icon
					return (
						<li key={tool.href} className="min-w-0">
							<Link
								href={tool.href}
								className="group flex min-w-0 flex-col items-center gap-1.5 rounded-sm border border-border bg-card/60 px-3 py-3 text-center transition-colors hover:border-primary/40 hover:bg-accent/40"
							>
								<Icon className="h-4 w-4 flex-none text-primary" />
								<span className="block w-full truncate text-xs font-medium">{nav(tool.labelKey)}</span>
							</Link>
						</li>
					)
				})}
			</ul>
		</div>
	)
}
