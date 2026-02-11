'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

type UseAppearAnimationOptions = {
	delay?: number
	duration?: number
	translateY?: number
	threshold?: number
	triggerOnce?: boolean
	rootMargin?: string
}

export function useAppearAnimation(options: UseAppearAnimationOptions = {}) {
	const {
		delay = 0,
		duration = 500,
		translateY = 24,
		threshold = 0.1,
		triggerOnce = true,
		rootMargin = '0px 0px -50px 0px',
	} = options

	const [isVisible, setIsVisible] = useState(false)

	const { ref, inView } = useInView({
		threshold,
		triggerOnce,
		rootMargin,
	})

	useEffect(() => {
		if (inView) {
			const timer = setTimeout(() => {
				setIsVisible(true)
			}, delay)
			return () => clearTimeout(timer)
		}
	}, [inView, delay])

	const style: React.CSSProperties = {
		opacity: isVisible ? 1 : 0,
		transform: isVisible ? 'translateY(0)' : `translateY(${translateY}px)`,
		transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
		willChange: 'opacity, transform',
	}

	return { ref, style, isVisible }
}
