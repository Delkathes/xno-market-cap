import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { createOrder } from '@/lib/nanswap-service'
import type { NanswapCreateOrderRequest } from '@/lib/nanswap-types'
import { getSecurityHeaders } from '@/lib/security-headers'

export async function POST(request: NextRequest) {
	const apiKey = process.env.NANSWAP_API_KEY

	if (!apiKey) {
		return NextResponse.json(
			{ error: 'Nanswap API key not configured' },
			{ status: 500, headers: getSecurityHeaders() },
		)
	}

	try {
		const body = (await request.json()) as NanswapCreateOrderRequest

		if (!body.from || !body.to || !body.amount || !body.toAddress) {
			return NextResponse.json(
				{ error: 'Missing required fields: from, to, amount, toAddress' },
				{ status: 400, headers: getSecurityHeaders() },
			)
		}

		if (body.amount <= 0) {
			return NextResponse.json(
				{ error: 'Amount must be greater than 0' },
				{ status: 400, headers: getSecurityHeaders() },
			)
		}

		const order = await createOrder(body, apiKey)

		return NextResponse.json(order, {
			headers: getSecurityHeaders(),
		})
	} catch (error) {
		console.error('Error creating order:', error)
		return NextResponse.json({ error: 'Failed to create order' }, { status: 500, headers: getSecurityHeaders() })
	}
}
