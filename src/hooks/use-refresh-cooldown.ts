'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const REFRESH_COOLDOWN = 60 // seconds

export function useRefreshCooldown() {
	const queryClient = useQueryClient()

	const [lastRefresh, setLastRefresh] = useState<number>(0)
	const [cooldownRemaining, setCooldownRemaining] = useState(0)

	useEffect(() => {
		if (cooldownRemaining <= 0) return

		const timer = setInterval(() => {
			const remaining = Math.max(0, REFRESH_COOLDOWN - Math.floor((Date.now() - lastRefresh) / 1000))
			setCooldownRemaining(remaining)
		}, 1000)

		return () => clearInterval(timer)
	}, [lastRefresh, cooldownRemaining])

	const handleRefresh = useCallback(() => {
		if (cooldownRemaining > 0) return

		queryClient.invalidateQueries({ queryKey: ['market-data'] })
		setLastRefresh(Date.now())
		setCooldownRemaining(REFRESH_COOLDOWN)
	}, [queryClient, cooldownRemaining])

	const isRefreshDisabled = cooldownRemaining > 0

	return { handleRefresh, isRefreshDisabled, cooldownRemaining }
}
