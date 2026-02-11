'use client'

import { useAppearAnimation } from '@/hooks/use-appear-animation'

type AppearProps = {
	children: React.ReactNode
	className?: string
	delay?: number
	duration?: number
	translateY?: number
	threshold?: number
	triggerOnce?: boolean
	rootMargin?: string
}

export function Appear({
	children,
	className = '',
	delay = 0,
	duration = 500,
	translateY = 24,
	threshold = 0.1,
	triggerOnce = true,
	rootMargin = '0px 0px -50px 0px',
}: AppearProps) {
	const { ref, style } = useAppearAnimation({
		delay,
		duration,
		translateY,
		threshold,
		triggerOnce,
		rootMargin,
	})

	return (
		<div ref={ref} style={style} className={className}>
			{children}
		</div>
	)
}
