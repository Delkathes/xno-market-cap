'use client'

import { useEffect } from 'react'

export const WIDGET_RESIZE_MESSAGE = 'nmc-widget-resize'

/**
 * Auto-fit embeds: measures the rendered widget's real height and posts it
 * to the host page, which applies it to the iframe (see /widgets/embed.js).
 * The widget height is width-dependent (compact below 380px), so this keeps
 * the iframe exactly as tall as its content — no fixed-height dead space.
 *
 * The widget element is measured, NOT documentElement: scrollHeight of the
 * document is at least the iframe's own viewport height, so it can only ever
 * grow the iframe, never shrink it. No-op when opened directly (no iframe).
 */
export function EmbedAutoHeight() {
	useEffect(() => {
		if (window.self === window.top) return

		const target = document.querySelector('.widget-respond') ?? document.body.firstElementChild
		if (!target) return

		let raf = 0
		const send = () => {
			cancelAnimationFrame(raf)
			raf = requestAnimationFrame(() => {
				const height = Math.ceil(target.getBoundingClientRect().height)
				window.parent.postMessage({ type: WIDGET_RESIZE_MESSAGE, height }, '*')
			})
		}

		send()
		const observer = new ResizeObserver(send)
		observer.observe(target)
		return () => {
			observer.disconnect()
			cancelAnimationFrame(raf)
		}
	}, [])

	return null
}
