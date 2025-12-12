'use client'

import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, RefreshCw } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface MarketDataErrorProps {
	error: Error | null
	compact?: boolean
}

export function MarketDataError({ error, compact = false }: MarketDataErrorProps) {
	const queryClient = useQueryClient()

	const handleRetry = () => {
		queryClient.invalidateQueries({ queryKey: ['market-data'] })
	}

	if (compact) {
		return (
			<div className="flex items-center justify-center gap-3 p-4 text-muted-foreground">
				<AlertCircle className="h-4 w-4 text-destructive" />
				<span className="text-sm">Unable to load market data</span>
				<Button variant="ghost" size="sm" onClick={handleRetry} className="h-7 px-2">
					<RefreshCw className="h-3 w-3 mr-1" />
					Retry
				</Button>
			</div>
		)
	}

	return (
		<Alert variant="destructive">
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>Failed to load market data</AlertTitle>
			<AlertDescription className="flex items-center justify-between">
				<span>{error?.message || 'An unexpected error occurred while fetching market data.'}</span>
				<Button variant="outline" size="sm" onClick={handleRetry} className="ml-4 shrink-0">
					<RefreshCw className="h-3 w-3 mr-1" />
					Try again
				</Button>
			</AlertDescription>
		</Alert>
	)
}
