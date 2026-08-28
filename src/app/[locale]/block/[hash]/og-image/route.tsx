import { ImageResponse } from 'next/og'
import { connection } from 'next/server'

import { getBlockDetails } from '@/lib/block-data-service'
import { isValidBlockHash } from '@/lib/nano-utils'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function shorten(hash: string): string {
	return `${hash.slice(0, 16)}…${hash.slice(-8)}`
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
	{ params }: { params: Promise<{ locale: string; hash: string }> },
): Promise<Response> {
	await connection()

	const { hash } = await params
	if (!isValidBlockHash(hash)) {
		return new Response('Not found', { status: 404 })
	}

	const details = await getBlockDetails(hash)
	if (!details) {
		return new Response('Not found', { status: 404 })
	}

	const subtype = (details.subtype || 'block').toUpperCase()

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
				<div
					style={{
						fontSize: 20,
						letterSpacing: '0.14em',
						color: details.confirmed ? '#4ade80' : '#fbbf24',
						border: `1px solid ${details.confirmed ? 'rgba(74, 222, 128, 0.45)' : 'rgba(251, 191, 36, 0.45)'}`,
						borderRadius: 6,
						padding: '6px 14px',
					}}
				>
					{details.confirmed ? 'CONFIRMED' : 'UNCONFIRMED'}
				</div>
			</div>

			<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
					<div style={{ fontSize: 22, letterSpacing: '0.22em', color: 'rgba(19, 188, 255, 0.95)' }}>
						BLOCK
					</div>
					<div
						style={{
							fontSize: 18,
							letterSpacing: '0.14em',
							color: 'rgba(242, 247, 251, 0.85)',
							border: '1px solid rgba(242, 247, 251, 0.3)',
							borderRadius: 6,
							padding: '4px 12px',
						}}
					>
						{subtype}
					</div>
				</div>
				<div style={{ fontSize: 30, color: 'rgba(242, 247, 251, 0.78)', wordBreak: 'break-all' }}>
					{shorten(hash)}
				</div>
			</div>

			<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
				<div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
					<div style={{ fontSize: 92, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
						{formatXno(details.amountXno)}
					</div>
					<div style={{ fontSize: 34, color: 'rgba(19, 188, 255, 1)' }}>XNO</div>
				</div>
				<div style={{ display: 'flex', fontSize: 26, color: 'rgba(242, 247, 251, 0.6)' }}>
					height {details.height > 0 ? details.height : 0} · {details.blockAccount.slice(0, 8)}…
					{details.blockAccount.slice(-4)}
				</div>
			</div>
		</div>,
		{
			...size,
			// Block data refreshes on a 5-minute cadence, so the image is safe
			// to cache at the edge for that long with a long
			// stale-while-revalidate; social crawlers (Discord/Telegram/X
			// previews) then hit the CDN instead of regenerating on every share.
			headers: {
				'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
			},
		},
	)
}
