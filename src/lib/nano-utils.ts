/**
 * Converts XNO amount to raw units
 * 1 XNO = 10^30 raw
 */
export function xnoToRaw(xno: number): string {
	const rawPerXno = BigInt('1000000000000000000000000000000') // 10^30
	const wholePart = BigInt(Math.floor(xno))
	const decimalPart = xno - Math.floor(xno)

	// Calculate raw for whole part
	const wholeRaw = wholePart * rawPerXno

	// Calculate raw for decimal part (up to 6 decimal places for precision)
	const decimalMultiplier = BigInt(Math.round(decimalPart * 1e6))
	const decimalRaw = (decimalMultiplier * rawPerXno) / BigInt(1e6)

	return (wholeRaw + decimalRaw).toString()
}

/**
 * Converts raw units to XNO amount
 * 1 XNO = 10^30 raw
 */
export function rawToXno(raw: string | bigint): number {
	const rawBigInt = typeof raw === 'string' ? BigInt(raw) : raw
	// Divide by 10^24 first, then divide result by 10^6 for decimal precision
	const intermediate = Number(rawBigInt / BigInt('1000000000000000000000000'))
	return intermediate / 1000000
}
