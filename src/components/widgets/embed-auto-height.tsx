'use client'

import { useEffect } from 'react'

export const WIDGET_RESIZE_MESSAGE = 'nmc-widget-resize'

/**
 * Auto-fit embeds: measures the rendered widget height and posts it to the
 * host page, which applies it to the iframe (see /widgets/embed.js). The
 * widget height is width-dependent (compact below 380px), so this keeps the
 * iframe exactly as tall as its content — no fixed-height dead space on
 * mobile. No-op when the page is opened directly instead of in an iframe.
 */
export function EmbedAutoHeight() {
	useEffect(() => {
		if (window.self === window.top) return

		let raf = 0
		const send = () => {
			cancelAnimationFrame(raf)
			raf = requestAnimationFrame(() => {
				const height = Math.ceil(document.documentElement.scrollHeight)
				window.parent.postMessage({ type: WIDGET_RESIZE_MESSAGE, height }, '*')
			})
		}

		send()
		const observer = new ResizeObserver(send)
		observer.observe(document.documentElement)
		return () => {
			observer.disconnect()
			cancelAnimationFrame(raf)
		}
	}, [])

	return null
}
