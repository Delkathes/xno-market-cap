import { getTranslations } from 'next-intl/server'

export async function MarketSummary({ locale }: { locale: string }) {
	const t = await getTranslations({ locale, namespace: 'home' })

	return <h1 className="sr-only">{t('seoTitle')}</h1>
}
