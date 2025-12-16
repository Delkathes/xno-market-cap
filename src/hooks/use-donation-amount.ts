'use client'

import { useCallback, useMemo, useState } from 'react'

import { createNanoUri, xnoToRaw } from '@/lib/nano-utils'
import { validateDonationAmount } from '@/lib/validation'

interface UseDonationAmountOptions {
	disabled?: boolean
	walletAddress: string
}

interface UseDonationAmountReturn {
	amount: number
	rawAmount: string
	nanoUri: string
	selectedAmount: number | null
	customAmount: string
	amountError: string | null
	shouldShowQr: boolean
	handleAmountSelect: (amt: number) => void
	handleCustomAmountChange: (value: string) => void
	reset: () => void
}

export function useDonationAmount(options: UseDonationAmountOptions): UseDonationAmountReturn {
	const { disabled = false, walletAddress } = options

	const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
	const [customAmount, setCustomAmount] = useState('')
	const [amountError, setAmountError] = useState<string | null>(null)

	const amount = selectedAmount ?? (customAmount ? Number.parseFloat(customAmount) : 0)
	const rawAmount = amount > 0 ? xnoToRaw(amount) : '0'
	const nanoUri = (amount > 0 && walletAddress ? createNanoUri(walletAddress, rawAmount) : null) ?? ''
	const shouldShowQr = amount > 0 && nanoUri !== ''

	const handleAmountSelect = useCallback(
		(amt: number) => {
			if (disabled) return

			const validation = validateDonationAmount(amt)
			if (!validation.success) {
				setAmountError(validation.error || 'Invalid amount')
				return
			}

			setAmountError(null)
			setSelectedAmount(amt)
			setCustomAmount('')
		},
		[disabled],
	)

	const handleCustomAmountChange = useCallback(
		(value: string) => {
			if (disabled) return

			if (value === '') {
				setCustomAmount('')
				setSelectedAmount(null)
				setAmountError(null)
				return
			}

			const num = Number.parseFloat(value)
			if (Number.isNaN(num)) return

			const validation = validateDonationAmount(num)
			if (!validation.success) {
				setAmountError(validation.error || 'Invalid amount')
				setCustomAmount(value)
				setSelectedAmount(null)
				return
			}

			setAmountError(null)
			setCustomAmount(value)
			setSelectedAmount(null)
		},
		[disabled],
	)

	const reset = useCallback(() => {
		setSelectedAmount(null)
		setCustomAmount('')
		setAmountError(null)
	}, [])

	return useMemo(
		() => ({
			amount,
			rawAmount,
			nanoUri,
			selectedAmount,
			customAmount,
			amountError,
			shouldShowQr,
			handleAmountSelect,
			handleCustomAmountChange,
			reset,
		}),
		[
			amount,
			rawAmount,
			nanoUri,
			selectedAmount,
			customAmount,
			amountError,
			shouldShowQr,
			handleAmountSelect,
			handleCustomAmountChange,
			reset,
		],
	)
}
