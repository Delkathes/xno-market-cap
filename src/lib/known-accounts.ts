/**
 * Known Nano account labels. Every entry is verified against public RPC
 * before being added (account exists and is active). Prefer the official
 * name of the operator; keep the table small and accurate over large.
 */
export const KNOWN_ACCOUNTS: Record<string, string> = {
	// Principal representative run by Nano Pay (verified active, ~1.66M XNO weight).
	nano_1xnopay1bfmyx5eit8ut4gg1j488kt8bjukijerbn37jh3wdm81y6mxjg8qj: 'Nano Pay',
}

export function getKnownLabel(address: string): string | null {
	return KNOWN_ACCOUNTS[address] ?? null
}
