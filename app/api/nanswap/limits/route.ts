import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getLimits } from '@/lib/nanswap-service'
import { getSecurityHeaders } from '@/lib/security-headers'

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams
	const from = searchParams.get('from')
	const to = searchParams.get('to')

	if (!from || !to) {
		return NextResponse.json(
			{ error: 'Missing required parameters: from, to' },
			{ status: 400, headers: getSecurityHeaders() },
		)
	}

	try {
		const limits = await getLimits(from, to)

		return NextResponse.json(limits, {
			headers: {
				...getSecurityHeaders(),
				'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
			},
		})
	} catch (error) {
		console.error('Error fetching limits:', error)
		return NextResponse.json({ error: 'Failed to get limits' }, { status: 500, headers: getSecurityHeaders() })
	}
}
