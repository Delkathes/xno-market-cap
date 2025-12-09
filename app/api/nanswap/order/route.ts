import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getOrder } from '@/lib/nanswap-service'
import { getSecurityHeaders } from '@/lib/security-headers'

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams
	const id = searchParams.get('id')

	if (!id) {
		return NextResponse.json(
			{ error: 'Missing required parameter: id' },
			{ status: 400, headers: getSecurityHeaders() },
		)
	}

	try {
		const order = await getOrder(id)

		return NextResponse.json(order, {
			headers: {
				...getSecurityHeaders(),
				'Cache-Control': 'no-cache',
			},
		})
	} catch (error) {
		console.error('Error fetching order:', error)
		return NextResponse.json({ error: 'Failed to get order' }, { status: 500, headers: getSecurityHeaders() })
	}
}
