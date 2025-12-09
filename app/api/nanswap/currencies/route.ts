import { NextResponse } from 'next/server'
import { getAllCurrencies } from '@/lib/nanswap-service'
import { getSecurityHeaders } from '@/lib/security-headers'

export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
	try {
		const currencies = await getAllCurrencies()

		return NextResponse.json(currencies, {
			headers: {
				...getSecurityHeaders(),
				'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
			},
		})
	} catch (error) {
		console.error('Error fetching Nanswap currencies:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch currencies' },
			{ status: 500, headers: getSecurityHeaders() },
		)
	}
}
