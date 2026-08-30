/**
 * News section layout: wraps both /news and /news/[slug]. Renders a fixed,
 * pointer-transparent readability scrim over the animated page gradient in
 * dark mode only (black at 50% = #00000080, fading in). The news content
 * (`relative isolate`) paints above it, so the scrim quiets the background
 * without dimming the articles themselves.
 */
export default function NewsLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 z-0 animate-scrim-in bg-transparent dark:bg-black/60"
			/>
			{children}
		</>
	)
}
