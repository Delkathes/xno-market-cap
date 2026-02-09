'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

type TerminalLine = {
	type: 'command' | 'status' | 'header' | 'detail' | 'success' | 'divider'
	text: string
	color?: string
	delay: number
}

const scenarioLines: TerminalLine[][] = [
	[
		{ type: 'command', text: '> Agent requesting api.weather-service.ai/forecast', delay: 0 },
		{ type: 'detail', text: '  { city: "London" }', delay: 0 },
		{ type: 'header', text: '← 402 Payment Required', color: 'text-yellow-400', delay: 500 },
		{ type: 'detail', text: '  X-Payment-Address: nano_1weather...', delay: 750 },
		{ type: 'detail', text: '  X-Payment-Amount: 0.0001 XNO', delay: 750 },
		{ type: 'detail', text: '  X-Payment-Network: nano:mainnet', delay: 750 },
		{ type: 'command', text: '> Creating signed block…', delay: 1200 },
		{ type: 'status', text: '  ✓ Confirmed in 0.35s', delay: 1400 },
		{ type: 'status', text: '  ✓ Block: A7F2C9...3E1B', delay: 1400 },
		{ type: 'command', text: '> Retrying with signed block…', delay: 2000 },
		{ type: 'success', text: '  ← 200 OK — Forecast data received', delay: 2500 },
	],
	[
		{ type: 'command', text: '> Agent requesting llm-gateway.io/v1/completions', delay: 0 },
		{ type: 'detail', text: '  { model: "mistral-large-3" }', delay: 0 },
		{ type: 'header', text: '← 402 Payment Required', color: 'text-yellow-400', delay: 500 },
		{ type: 'detail', text: '  X-Payment-Address: nano_1llmgtw...', delay: 750 },
		{ type: 'detail', text: '  X-Payment-Amount: 0.00042 XNO', delay: 750 },
		{ type: 'detail', text: '  X-Payment-Network: nano:mainnet', delay: 750 },
		{ type: 'command', text: '> Creating signed block…', delay: 1200 },
		{ type: 'status', text: '  ✓ Confirmed in 0.28s', delay: 1400 },
		{ type: 'status', text: '  ✓ Block: D4E1A8...7C09', delay: 1400 },
		{ type: 'command', text: '> Retrying with signed block…', delay: 2000 },
		{ type: 'success', text: '  ← 200 OK — Streaming 1,247 tokens', delay: 2500 },
	],
]

const DISPLAY_DURATION = 10000
const FADE_DURATION = 400

export function AnimatedTerminal() {
	const t = useTranslations('whyNano.x402')
	const [scenarioIndex, setScenarioIndex] = useState(0)
	const [visibleLines, setVisibleLines] = useState(0)
	const [isFading, setIsFading] = useState(false)

	const lines = scenarioLines[scenarioIndex]

	// Get footer content based on current scenario
	const footerTitle = scenarioIndex === 0 ? t('apiPaymentFlow.title') : t('llmBilling.title')
	const footerDescription = scenarioIndex === 0 ? t('apiPaymentFlow.description') : t('llmBilling.description')

	// Animate lines appearing one by one
	useEffect(() => {
		setVisibleLines(0)
		setIsFading(false)

		const timers: ReturnType<typeof setTimeout>[] = []
		const currentLines = scenarioLines[scenarioIndex]

		for (let i = 0; i < currentLines.length; i++) {
			timers.push(
				setTimeout(() => {
					setVisibleLines(i + 1)
				}, currentLines[i].delay),
			)
		}

		const lastDelay = currentLines[currentLines.length - 1].delay

		// Start fade out, then switch scenario
		timers.push(
			setTimeout(() => {
				setIsFading(true)
			}, lastDelay + DISPLAY_DURATION),
		)
		timers.push(
			setTimeout(
				() => {
					setScenarioIndex((prev) => (prev + 1) % scenarioLines.length)
				},
				lastDelay + DISPLAY_DURATION + FADE_DURATION,
			),
		)

		return () => {
			for (const t of timers) clearTimeout(t)
		}
	}, [scenarioIndex])

	function renderLine(line: TerminalLine) {
		switch (line.type) {
			case 'command':
				return (
					<>
						<span className="text-zinc-500">{'>'}</span>{' '}
						<span className="text-white">{line.text.slice(2)}</span>
					</>
				)
			case 'header':
				return <span className={line.color ?? 'text-yellow-400'}>{line.text}</span>
			case 'detail': {
				const colonIdx = line.text.indexOf(':')
				if (colonIdx === -1) return <span className="text-zinc-400">{line.text}</span>
				const key = line.text.slice(0, colonIdx + 1)
				const value = line.text.slice(colonIdx + 1)
				const colorClass = key.includes('Address')
					? 'text-green-400'
					: key.includes('Amount')
						? 'text-orange-400'
						: 'text-purple-400'
				return (
					<span className="text-zinc-400">
						{key}
						<span className={colorClass}>{value}</span>
					</span>
				)
			}
			case 'status': {
				const parts = line.text.trimStart()
				return (
					<>
						<span className="text-green-500">✓</span>{' '}
						<span className="text-zinc-400">{parts.slice(2)}</span>
					</>
				)
			}
			case 'success':
				return <span className="text-green-400">{line.text.trimStart()}</span>
			default:
				return <span className="text-zinc-400">{line.text}</span>
		}
	}

	return (
		<div className="rounded-xl border border-border bg-zinc-950 dark:bg-zinc-950 overflow-hidden shadow-xl">
			<div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
				<div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
				<div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
				<div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50" />
				<div className="ml-4 text-xs font-mono text-zinc-500">AI Agent Terminal</div>
				{/* Scenario indicator */}
				<div className="ml-auto flex items-center gap-1.5">
					{scenarioLines.map((lineGroup, i) => (
						<div
							key={`indicator-${lineGroup[0]?.text.slice(0, 20) ?? i}`}
							className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
								i === scenarioIndex ? 'bg-cyan-400' : 'bg-zinc-700'
							}`}
						/>
					))}
				</div>
			</div>

			<div className="p-6 md:p-8">
				{/* Terminal lines */}
				<div
					className={`font-mono text-sm md:text-base transition-opacity duration-300 ${
						isFading ? 'opacity-0' : 'opacity-100'
					}`}
				>
					<div className="space-y-1.5 text-zinc-300 min-h-83.5 md:min-h-90">
						{lines.slice(0, visibleLines).map((line, i) => {
							const isLast = i === visibleLines - 1
							return (
								<div
									key={`${scenarioIndex}-${line.delay}-${i}`}
									className={`${line.type === 'command' && i > 0 ? 'pt-3' : ''} ${
										isLast ? 'animate-[fade-in_0.25s_ease-out]' : ''
									}`}
									style={
										line.type === 'detail' || line.type === 'status'
											? { paddingLeft: '1rem' }
											: undefined
									}
								>
									{renderLine(line)}
								</div>
							)
						})}
						{/* Blinking cursor */}
						{visibleLines < lines.length && (
							<div className="pt-2">
								<span className="inline-block w-2 h-4 bg-zinc-400 animate-pulse" />
							</div>
						)}
					</div>
				</div>

				{/* Footer — always visible, fades in on scenario switch */}
				<div className="h-px bg-zinc-800 my-5" />
				<div
					className={`font-sans space-y-1.5 transition-opacity duration-500 ${
						isFading ? 'opacity-0' : 'opacity-100'
					}`}
				>
					<h4 className="text-white font-bold text-sm">{footerTitle}</h4>
					<p className="text-zinc-500 text-xs leading-relaxed">{footerDescription}</p>
				</div>
			</div>
		</div>
	)
}
