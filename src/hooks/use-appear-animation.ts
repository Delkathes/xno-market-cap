'use client'

import { useEffect, useRef, useState } from 'react'

type UseAppearAnimationOptions = {
	delay?: number
	duration?: number
	translateY?: number
	threshold?: number
	triggerOnce?: boolean
	rootMargin?: string
}

// Local IntersectionObserver replacement for react-intersection-observer. Kept
// behaviour-identical on purpose: a CSS view() timeline cannot express the
// time-based `delay` cascade and, being bidirectional, would re-fade content on
// scroll-back instead of firing once.
export function useAppearAnimation(options: UseAppearAnimationOptions = {}) {
	const {
		delay = 0,
		duration = 500,
		translateY = 24,
		threshold = 0.1,
		triggerOnce = true,
		rootMargin = '0px 0px -50px 0px',
	} = options

	const ref = useRef<HTMLDivElement | null>(null)
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		const element = ref.current
		if (!element) return

		if (typeof IntersectionObserver === 'undefined') {
			setIsVisible(true)
			return
		}

		let timer: ReturnType<typeof setTimeout> | undefined

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue
					if (delay > 0) {
						timer = setTimeout(() => setIsVisible(true), delay)
					} else {
						setIsVisible(true)
					}
					if (triggerOnce) observer.disconnect()
				}
			},
			{ threshold, rootMargin },
		)

		observer.observe(element)

		return () => {
			observer.disconnect()
			if (timer) clearTimeout(timer)
		}
	}, [threshold, rootMargin, triggerOnce, delay])

	const style: React.CSSProperties = {
		opacity: isVisible ? 1 : 0,
		transform: translateY === 0 ? undefined : isVisible ? 'none' : `translateY(${translateY}px)`,
		transition:
			translateY === 0
				? `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
				: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
		willChange: isVisible ? 'auto' : translateY === 0 ? 'opacity' : 'opacity, transform',
	}

	return { ref, style, isVisible }
}
