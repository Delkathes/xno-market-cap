'use client'

import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface MarketDataErrorProps {
	error: Error | null
	compact?: boolean
}

export function MarketDataError({ error, compact = false }: MarketDataErrorProps) {
	const t = useTranslations('error')

	const queryClient = useQueryClient()

	const handleRetry = () => {
		queryClient.invalidateQueries({ queryKey: ['market-data'] })
	}

	if (compact) {
		return (
			<div className="flex items-center justify-center gap-3 p-4 text-muted-foreground">
				<AlertCircle className="h-4 w-4 text-destructive" />
				<span className="text-sm">{t('unableToLoadMarketData')}</span>
				<Button variant="ghost" size="sm" onClick={handleRetry} className="h-7 px-2">
					<RefreshCw className="h-3 w-3 mr-1" />
					{t('retry')}
				</Button>
			</div>
		)
	}

	return (
		<Alert variant="destructive">
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>{t('failedToLoadMarketData')}</AlertTitle>
			<AlertDescription className="flex items-center justify-between">
				<span>{error?.message || t('unexpectedError')}</span>
				<Button variant="outline" size="sm" onClick={handleRetry} className="ml-4 shrink-0">
					<RefreshCw className="h-3 w-3 mr-1" />
					{t('tryAgain')}
				</Button>
			</AlertDescription>
		</Alert>
	)
}
