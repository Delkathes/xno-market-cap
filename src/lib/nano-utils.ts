import { checkAddress, checkAmount, checkHash, checkSignature, checkWork, convert, Unit } from 'nanocurrency'

/**
 * Converts XNO amount to raw units using nanocurrency library
 * 1 XNO = 10^30 raw
 * Returns '0' if conversion fails
 */
export function xnoToRaw(xno: number | string): string {
	try {
		const value = typeof xno === 'number' ? xno.toString() : xno
		return convert(value, { from: Unit.Nano, to: Unit.raw })
	} catch {
		return '0'
	}
}

/**
 * Converts raw units to XNO amount using nanocurrency library
 * 1 XNO = 10^30 raw
 * Returns the XNO amount as a number (may lose precision for extreme values)
 * Returns 0 if conversion fails
 */
export function rawToXno(raw: string): number {
	try {
		const nano = convert(raw, { from: Unit.raw, to: Unit.Nano })
		return Number.parseFloat(nano)
	} catch {
		return 0
	}
}

/**
 * Validates a Nano address (nano_ or xno_ prefix) with checksum verification
 * Uses nanocurrency library for proper validation
 */
export function isValidNanoAddress(address: string): boolean {
	return checkAddress(address)
}

/**
 * Validates a raw amount string (must be a valid integer that can be embedded in a block balance)
 * Uses nanocurrency library for proper validation
 */
export function isValidRawAmount(amount: string): boolean {
	return checkAmount(amount)
}

/**
 * Validates a block hash (64 character hex string)
 * Uses nanocurrency library for proper validation
 */
export function isValidBlockHash(hash: string): boolean {
	return checkHash(hash)
}

/**
 * Validates a block signature (128 character hex string)
 * Uses nanocurrency library for proper validation
 */
export function isValidSignature(signature: string): boolean {
	return checkSignature(signature)
}

/**
 * Validates a proof of work (16 character hex string)
 * Note: This only validates the format, not the difficulty
 * Uses nanocurrency library for proper validation
 */
export function isValidWork(work: string): boolean {
	return checkWork(work)
}

/**
 * Creates a nano: URI for QR code generation with validation
 * Returns null if address or amount is invalid
 */
export function createNanoUri(
	address: string,
	rawAmount: string,
	options?: { label?: string; message?: string },
): string | null {
	if (!isValidNanoAddress(address)) {
		return null
	}
	if (rawAmount !== '0' && !isValidRawAmount(rawAmount)) {
		return null
	}
	let uri = `nano:${address}`
	const params: string[] = []
	if (rawAmount !== '0') {
		params.push(`amount=${rawAmount}`)
	}
	if (options?.label) {
		params.push(`label=${encodeURIComponent(options.label)}`)
	}
	if (options?.message) {
		params.push(`message=${encodeURIComponent(options.message)}`)
	}
	if (params.length > 0) {
		uri += `?${params.join('&')}`
	}
	return uri
}
