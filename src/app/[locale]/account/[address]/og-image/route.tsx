import { ImageResponse } from 'next/og'
import { connection } from 'next/server'

import { getAccountData } from '@/lib/account-data-service'
import { getCompareRates, getMarketData } from '@/lib/market-data-service'
import { isValidNanoAddress } from '@/lib/nano-utils'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function shorten(address: string): string {
	return `${address.slice(0, 14)}…${address.slice(-8)}`
}

function formatXno(xno: number): string {
	if (xno >= 1_000_000) return `${(xno / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}M`
	if (xno >= 1) return xno.toLocaleString('en-US', { maximumFractionDigits: 2 })
	if (xno > 0) return xno.toLocaleString('en-US', { maximumFractionDigits: 6 })
	return '0'
}

const FONT = `ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace`

const REGISTRATION_MARK = (position: string) => ({
	position: 'absolute' as const,
	width: 22,
	height: 22,
	borderColor: 'rgba(19, 188, 255, 0.55)',
	[position.startsWith('top') ? 'top' : 'bottom']: 36,
	[position.endsWith('left') ? 'left' : 'right']: 36,
	borderLeftWidth: position.endsWith('left') ? 3 : 0,
	borderRightWidth: position.endsWith('right') ? 3 : 0,
	borderTopWidth: position.startsWith('top') ? 3 : 0,
	borderBottomWidth: position.startsWith('bottom') ? 3 : 0,
	borderStyle: 'solid',
})

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ locale: string; address: string }> },
): Promise<Response> {
	await connection()

	const { address } = await params
	if (!isValidNanoAddress(address)) {
		return new Response('Not found', { status: 404 })
	}

	const [result, market, rates] = await Promise.all([
		getAccountData(address),
		getMarketData().catch(() => null),
		getCompareRates().catch(() => null),
	])

	const balanceXno = result.ok ? result.data.balanceXno : 0
	const principal = result.ok ? result.data.principal : false
	const usdPerXno = market?.xnoData.current_price ?? rates?.fiats.find((fiat) => fiat.code === 'USD')?.perXno ?? null
	const usdValue = usdPerXno !== null ? balanceXno * usdPerXno : null

	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				background: 'linear-gradient(140deg, #0d2b45 0%, #134e6f 55%, #0a2338 100%)',
				padding: 56,
				fontFamily: FONT,
				color: '#f2f7fb',
			}}
		>
			<div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
				{['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((position) => (
					<div key={position} style={REGISTRATION_MARK(position) as Record<string, string | number>} />
				))}
			</div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
					<div
						style={{
							width: 26,
							height: 26,
							borderRadius: 6,
							background: '#13bcff',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: '#04121f',
							fontWeight: 700,
							fontSize: 16,
						}}
					>
						Ӿ
					</div>
					<div style={{ fontSize: 26, letterSpacing: '0.18em', color: 'rgba(242, 247, 251, 0.92)' }}>
						NANOMARKETCAP
					</div>
				</div>
				{principal && (
					<div
						style={{
							fontSize: 20,
							letterSpacing: '0.14em',
							color: '#4ade80',
							border: '1px solid rgba(74, 222, 128, 0.45)',
							borderRadius: 6,
							padding: '6px 14px',
						}}
					>
						PRINCIPAL REP
					</div>
				)}
			</div>

			<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
				<div style={{ fontSize: 22, letterSpacing: '0.22em', color: 'rgba(19, 188, 255, 0.95)' }}>ACCOUNT</div>
				<div style={{ fontSize: 30, color: 'rgba(242, 247, 251, 0.78)', wordBreak: 'break-all' }}>
					{shorten(address)}
				</div>
			</div>

			<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
				<div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
					<div style={{ fontSize: 92, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
						{formatXno(balanceXno)}
					</div>
					<div style={{ fontSize: 34, color: 'rgba(19, 188, 255, 1)' }}>XNO</div>
				</div>
				{usdValue !== null && (
					<div style={{ fontSize: 30, color: 'rgba(242, 247, 251, 0.6)' }}>
						{usdValue.toLocaleString('en-US', {
							style: 'currency',
							currency: 'USD',
							maximumFractionDigits: usdValue >= 1 ? 2 : 4,
						})}
					</div>
				)}
			</div>
		</div>,
		{ ...size },
	)
}
