import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { Button } from '@/components/ui/button'
import { ModernPageBackground } from '@/components/modern-page-background'

export default async function NotFoundPage() {
	const t = await getTranslations('notFound')

	return (
		<main className="relative isolate container mx-auto px-4 py-24">
			<ModernPageBackground />

			<div className="mx-auto max-w-md animate-fade-in-up text-center">
				<p className="font-mono text-7xl font-bold tracking-tight text-[#209CE9]">404</p>
				<p className="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
					{t('code')}
				</p>
				<h1 className="mt-6 text-2xl font-bold tracking-tight">{t('title')}</h1>
				<p className="mt-3 text-sm text-muted-foreground">{t('description')}</p>
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<Button asChild>
						<Link href="/">{t('backHome')}</Link>
					</Button>
					<Button variant="ghost" asChild>
						<Link href="/news">{t('backNews')}</Link>
					</Button>
				</div>
			</div>
		</main>
	)
}
