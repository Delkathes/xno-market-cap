import { type SVGProps, useId } from 'react'

import { cn } from '@/lib/utils'

type XAbstractIconProps = SVGProps<SVGSVGElement> & {
	title?: string
}

export function XAbstractIcon({ className, title = 'NanoMarketCap logo', ...props }: XAbstractIconProps) {
	const id = useId()
	const accessibleTitle = title?.trim() ? title : undefined
	const primaryGradientId = `${id}-primary-gradient`
	const secondaryGradientId = `${id}-secondary-gradient`
	const coreGradientId = `${id}-core-gradient`

	return (
		<svg
			viewBox="0 0 256 256"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label={accessibleTitle}
			aria-hidden={accessibleTitle ? undefined : true}
			className={cn('size-10 shrink-0', className)}
			{...props}
		>
			<defs>
				<linearGradient id={primaryGradientId} x1="56" y1="192" x2="200" y2="56" gradientUnits="userSpaceOnUse">
					<stop stopColor="#22B8FF" />
					<stop offset="1" stopColor="#EFFFFF" />
				</linearGradient>
				<linearGradient
					id={secondaryGradientId}
					x1="56"
					y1="56"
					x2="200"
					y2="192"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#EFFFFF" />
					<stop offset="1" stopColor="#179FEA" />
				</linearGradient>
				<linearGradient id={coreGradientId} x1="128" y1="98" x2="128" y2="158" gradientUnits="userSpaceOnUse">
					<stop stopColor="#0A2037" />
					<stop offset="1" stopColor="#0E3D67" />
				</linearGradient>
			</defs>

			<path d="M56 170L116 110L136 130L76 190L56 170Z" fill={`url(#${primaryGradientId})`} />
			<path d="M120 106L180 46L200 66L140 126L120 106Z" fill={`url(#${primaryGradientId})`} />
			<path d="M56 86L76 66L136 126L116 146L56 86Z" fill={`url(#${secondaryGradientId})`} />
			<path d="M120 150L140 130L200 190L180 210L120 150Z" fill={`url(#${secondaryGradientId})`} />

			<path d="M90 168L128 130L166 168L128 206L90 168Z" fill={`url(#${coreGradientId})`} />
			<path d="M90 88L128 50L166 88L128 126L90 88Z" fill={`url(#${coreGradientId})`} />

			<path d="M99 160L128 131L157 160" stroke="#081E34" strokeWidth="7" strokeLinecap="round" />
			<path d="M99 96L128 125L157 96" stroke="#081E34" strokeWidth="7" strokeLinecap="round" />

			<circle cx="128" cy="128" r="10" fill="#EFFFFF" />
		</svg>
	)
}
