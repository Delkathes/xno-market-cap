import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getEstimateReverse } from '@/lib/nanswap-service'
import { getSecurityHeaders } from '@/lib/security-headers'

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams
	const from = searchParams.get('from')
	const to = searchParams.get('to')
	const amount = searchParams.get('amount')

	if (!from || !to || !amount) {
		return NextResponse.json(
			{ error: 'Missing required parameters: from, to, amount' },
			{ status: 400, headers: getSecurityHeaders() },
		)
	}

	const amountNum = Number.parseFloat(amount)
	if (Number.isNaN(amountNum) || amountNum <= 0) {
		return NextResponse.json({ error: 'Invalid amount' }, { status: 400, headers: getSecurityHeaders() })
	}

	try {
		const estimate = await getEstimateReverse(from, to, amountNum)

		return NextResponse.json(estimate, {
			headers: {
				...getSecurityHeaders(),
				// "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
			},
		})
	} catch (error) {
		console.error('Error fetching reverse estimate:', error)
		return NextResponse.json(
			{ error: 'Failed to get reverse estimate' },
			{ status: 500, headers: getSecurityHeaders() },
		)
	}
}
