'use client'

import { useTranslations } from 'next-intl'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface AboutModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
	const t = useTranslations('about')

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t('title')}</DialogTitle>
					<DialogDescription className="sr-only">{t('description')}</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 text-sm text-muted-foreground">
					<p>
						<strong className="text-foreground">NanoMarketCap</strong> {t('intro')}
					</p>
					<p>{t('perspective')}</p>
					<div className="space-y-2">
						<p className="font-medium text-foreground">{t('keyFeatures')}</p>
						<ul className="list-disc list-inside space-y-1 ml-2">
							<li>{t('feature1')}</li>
							<li>{t('feature2')}</li>
							<li>{t('feature3')}</li>
							<li>{t('feature4')}</li>
							<li>{t('feature5')}</li>
						</ul>
					</div>
					<p className="text-xs border-t border-border pt-4 mt-4">{t('dataSource')}</p>
				</div>
			</DialogContent>
		</Dialog>
	)
}
