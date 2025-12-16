'use client'

import { useCallback, useEffect, useMemo } from 'react'

import { useDonationAmount } from './use-donation-amount'
import { useDonationWebSocket } from './use-donation-websocket'

interface UseDonationOptions {
	/** Called when a donation payment is detected */
	onDonationReceived?: () => void
	/** Whether the modal is open (controls WebSocket connection) */
	isOpen: boolean
	/** The wallet address to use for donations */
	walletAddress: string
}

interface UseDonationReturn {
	// Amount state
	amount: number
	rawAmount: string
	nanoUri: string
	selectedAmount: number | null
	customAmount: string
	amountError: string | null
	shouldShowQr: boolean

	// WebSocket state
	wsConnected: boolean
	paymentReceived: boolean
	receivedAmount: number | null

	// Actions
	handleAmountSelect: (amt: number) => void
	handleCustomAmountChange: (value: string) => void
	reset: () => void
}

export function useDonation({ onDonationReceived, isOpen, walletAddress }: UseDonationOptions): UseDonationReturn {
	const {
		amount,
		rawAmount,
		nanoUri,
		selectedAmount,
		customAmount,
		amountError,
		shouldShowQr,
		handleAmountSelect,
		handleCustomAmountChange,
		reset: resetAmount,
	} = useDonationAmount({ disabled: false, walletAddress })

	const shouldListenForPayment = isOpen && shouldShowQr

	const {
		wsConnected,
		paymentReceived,
		receivedAmount,
		reset: resetWebSocket,
	} = useDonationWebSocket({
		shouldListen: shouldListenForPayment,
		walletAddress,
		onDonationReceived,
	})

	// Disable amount changes when payment received
	const guardedHandleAmountSelect = useCallback(
		(amt: number) => {
			if (paymentReceived) return
			handleAmountSelect(amt)
		},
		[handleAmountSelect, paymentReceived],
	)

	const guardedHandleCustomAmountChange = useCallback(
		(value: string) => {
			if (paymentReceived) return
			handleCustomAmountChange(value)
		},
		[handleCustomAmountChange, paymentReceived],
	)

	// Consolidated reset
	const reset = useCallback(() => {
		resetAmount()
		resetWebSocket()
	}, [resetAmount, resetWebSocket])

	// Auto-reset when modal closes
	useEffect(() => {
		if (!isOpen) {
			reset()
		}
	}, [isOpen, reset])

	return useMemo(
		() => ({
			amount,
			rawAmount,
			nanoUri,
			selectedAmount,
			customAmount,
			amountError,
			shouldShowQr,
			wsConnected,
			paymentReceived,
			receivedAmount,
			handleAmountSelect: guardedHandleAmountSelect,
			handleCustomAmountChange: guardedHandleCustomAmountChange,
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
			wsConnected,
			paymentReceived,
			receivedAmount,
			guardedHandleAmountSelect,
			guardedHandleCustomAmountChange,
			reset,
		],
	)
}
