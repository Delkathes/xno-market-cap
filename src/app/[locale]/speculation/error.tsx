'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function SpeculationError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	const t = useTranslations('error')

	useEffect(() => {
		console.error('Speculation page error:', error)
	}, [error])

	return (
		<main className="container mx-auto px-4 py-16">
			<Card className="max-w-lg mx-auto">
				<CardContent className="p-8 text-center space-y-6">
					<div className="w-16 h-16 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
						<AlertTriangle className="w-8 h-8 text-destructive" />
					</div>
					<div className="space-y-2">
						<h1 className="text-2xl font-bold">{t('failedToLoadSpeculation')}</h1>
						<p className="text-muted-foreground">{t('speculationLoadError')}</p>
					</div>
					{error.digest && (
						<p className="text-xs text-muted-foreground font-mono">
							{t('errorId', { digest: error.digest })}
						</p>
					)}
					<Button onClick={reset} className="gap-2">
						<RefreshCw className="w-4 h-4" />
						{t('tryAgain')}
					</Button>
				</CardContent>
			</Card>
		</main>
	)
}
