'use client'

import { useEffect, useMemo, useState } from 'react'
import {
	Calculator,
	Check,
	Contact,
	Copy,
	Gauge,
	Heart,
	LineChart,
	type LucideIcon,
	Network,
	Radio,
} from 'lucide-react'

import { isValidNanoAddress } from '@/lib/nano-utils'
import { cn } from '@/lib/utils'

import { CoinPickerDropdown } from '@/components/widgets/coin-picker'
import { HighlightedSnippet } from '@/components/widgets/snippet-highlight'
import {
	AVAILABLE_WIDGETS,
	buildEmbedUrl,
	DEFAULT_ACCOUNT_ADDRESS,
	DEFAULT_CRYPTOS,
	DEFAULT_WIDGET_PARAMS,
	defaultSecondaryFiats,
	LOCALE_LABELS,
	WIDGET_CURRENCIES,
	WIDGET_HEIGHTS,
	WIDGET_TYPES,
	type WidgetLocale,
	type WidgetParams,
	type WidgetStrings,
	type WidgetType,
} from '@/components/widgets/widget-registry'

const WIDGET_CRYPTO_LIMIT = 8

const TYPE_ICONS: Record<WidgetType, LucideIcon> = {
	price: LineChart,
	'market-cap': Gauge,
	calculator: Calculator,
	network: Network,
	account: Contact,
	live: Radio,
	donate: Heart,
}

/** i18n keys per widget type (type-safe lookups into WidgetStrings). */
const TYPE_KEYS: Record<WidgetType, { label: keyof WidgetStrings; desc: keyof WidgetStrings }> = {
	price: { label: 'typePrice', desc: 'descPrice' },
	'market-cap': { label: 'typeMarketCap', desc: 'descMarketCap' },
	calculator: { label: 'typeCalculator', desc: 'descCalculator' },
	network: { label: 'typeNetwork', desc: 'descNetwork' },
	account: { label: 'typeAccount', desc: 'descAccount' },
	live: { label: 'typeLive', desc: 'descLive' },
	donate: { label: 'typeDonate', desc: 'descDonate' },
}

/** Tiny cyan corner registration marks, echoed on every console panel. */
function CornerTicks() {
	return (
		<>
			<span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-3 w-px bg-[#209CE9]/40" />
			<span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-px w-3 bg-[#209CE9]/40" />
			<span aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-3 w-px bg-[#209CE9]/40" />
			<span aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-px w-3 bg-[#209CE9]/40" />
			<span
				aria-hidden="true"
				className="pointer-events-none absolute bottom-0 left-0 h-3 w-px bg-[#209CE9]/40"
			/>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute bottom-0 left-0 h-px w-3 bg-[#209CE9]/40"
			/>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute bottom-0 right-0 h-3 w-px bg-[#209CE9]/40"
			/>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute bottom-0 right-0 h-px w-3 bg-[#209CE9]/40"
			/>
		</>
	)
}

function PanelLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
			<span className="h-1.5 w-1.5 rounded-full bg-[#209CE9] shadow-[0_0_8px_2px_rgba(32,156,233,0.5)]" />
			{children}
		</div>
	)
}

function Chip({
	active,
	onClick,
	children,
	disabled = false,
}: {
	active?: boolean
	onClick?: () => void
	children: React.ReactNode
	disabled?: boolean
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				'cursor-pointer rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors',
				active
					? 'border-[#209CE9]/70 bg-[#209CE9]/10 text-[#209CE9]'
					: 'border-dashed border-border text-muted-foreground hover:border-[#209CE9]/50 hover:text-foreground',
				disabled && 'cursor-not-allowed opacity-40 hover:border-border hover:text-muted-foreground',
			)}
		>
			{children}
		</button>
	)
}

export function WidgetBuilder({
	strings,
	siteUrl,
	pickableCoins,
}: {
	strings: WidgetStrings
	siteUrl: string
	pickableCoins: { symbol: string; name: string; marketCapRank: number }[]
}) {
	const [type, setType] = useState<WidgetType>('price')
	const [address, setAddress] = useState(DEFAULT_ACCOUNT_ADDRESS)
	const [params, setParams] = useState<WidgetParams>(DEFAULT_WIDGET_PARAMS)
	const [locale, setLocale] = useState<WidgetLocale>('en')
	const [copied, setCopied] = useState(false)
	// Auto-fit: the preview embed reports its real (width-dependent) height.
	const [previewHeight, setPreviewHeight] = useState<number | null>(null)

	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			const data = event.data as { type?: unknown; height?: unknown } | null | undefined
			if (data?.type !== 'nmc-widget-resize') return
			const { height } = data
			if (typeof height === 'number' && height >= 100 && height <= 800) {
				setPreviewHeight(height)
			}
		}
		window.addEventListener('message', onMessage)
		return () => window.removeEventListener('message', onMessage)
	}, [])

	const patch = (partial: Partial<WidgetParams>) => setParams((current) => ({ ...current, ...partial }))

	// The live preview is relative: same-origin by construction, immune to
	// www/non-www and preview-domain mismatches against NEXT_PUBLIC_SITE_URL.
	// The snippet keeps the absolute canonical URL (it runs on external sites).
	const embedPath = buildEmbedUrl(
		'',
		locale,
		type,
		params,
		type === 'account' || type === 'donate' ? address : undefined,
	)
	const embedUrl = buildEmbedUrl(
		siteUrl,
		locale,
		type,
		params,
		type === 'account' || type === 'donate' ? address : undefined,
	)
	const height = WIDGET_HEIGHTS[type][params.compact ? 'compact' : 'full']

	const snippet = useMemo(
		() =>
			`<iframe\n  src="${embedUrl}"\n  loading="lazy"\n  width="100%"\n  height="${height}"\n  title="${strings[TYPE_KEYS[type].label]} · NanoMarketCap"\n  style="border:0;border-radius:8px;overflow:hidden;max-width:min(400px,100vw);margin-inline:auto;display:block"\n></iframe>\n<script src="${siteUrl}/widgets/embed.js" defer></script>`,
		[embedUrl, height, siteUrl, strings, type],
	)

	const copySnippet = async () => {
		try {
			await navigator.clipboard.writeText(snippet)
			setCopied(true)
			window.setTimeout(() => setCopied(false), 1600)
		} catch {}
	}

	return (
		<div className="space-y-10">
			{/* ============ HERO ============ */}
			<header className="animate-fade-in-up">
				<div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#209CE9] opacity-60" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-[#209CE9]" />
					</span>
					{strings.kicker}
				</div>
				<h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-5xl">
					{strings.title.split(' ').slice(0, -1).join(' ')}{' '}
					<span className="bg-linear-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
						{strings.title.split(' ').at(-1)}
					</span>
				</h1>
				<p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">{strings.sub}</p>
			</header>

			{/* ============ CONSOLE ============ */}
			<div
				className="grid animate-fade-in-up gap-4 lg:grid-cols-[380px_minmax(0,1fr)]"
				style={{ animationDelay: '80ms' }}
			>
				{/* ---- Signal source ---- */}
				<section className="relative min-w-0 rounded-md border border-border bg-card p-4 sm:p-5">
					<CornerTicks />
					<PanelLabel>{strings.rackLabel}</PanelLabel>

					<div className="space-y-1">
						{WIDGET_TYPES.map((widget) => {
							const Icon = TYPE_ICONS[widget]
							const available = AVAILABLE_WIDGETS.includes(widget)
							const active = type === widget
							return (
								<button
									key={widget}
									type="button"
									disabled={!available}
									onClick={() => setType(widget)}
									className={cn(
										'flex w-full cursor-pointer items-center gap-3 rounded-sm border px-3 py-2.5 text-left transition-colors',
										active
											? 'border-[#209CE9]/60 bg-[#209CE9]/8'
											: 'border-transparent hover:bg-accent/40',
										!available && 'cursor-not-allowed opacity-50 hover:bg-transparent',
									)}
								>
									<Icon
										className={cn(
											'h-4 w-4 flex-none',
											active ? 'text-[#209CE9]' : 'text-muted-foreground',
										)}
									/>
									<span className="min-w-0 flex-1">
										<span className="block text-sm font-medium">
											{strings[TYPE_KEYS[widget].label]}
										</span>
										<span className="block text-[11px] leading-snug text-muted-foreground">
											{strings[TYPE_KEYS[widget].desc]}
										</span>
									</span>
									{!available ? (
										<span className="rounded-sm border border-dashed border-border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
											{strings.soon}
										</span>
									) : (
										<span
											aria-hidden="true"
											className={cn(
												'h-1.5 w-1.5 flex-none rounded-full',
												active
													? 'bg-[#209CE9] shadow-[0_0_8px_2px_rgba(32,156,233,0.5)]'
													: 'bg-border',
											)}
										/>
									)}
								</button>
							)
						})}
					</div>

					{/* ---- Parameters ---- */}
					<div className="mt-5 space-y-4 border-t border-dashed border-border pt-4">
						{(type === 'price' || type === 'market-cap' || type === 'calculator' || type === 'account') && (
							<>
								<div>
									<div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
										{strings.paramCurrency}
									</div>
									<div className="flex flex-wrap gap-1.5">
										{WIDGET_CURRENCIES.map((currency) => (
											<Chip
												key={currency}
												active={params.currency === currency}
												onClick={() => patch({ currency })}
											>
												{currency}
											</Chip>
										))}
									</div>
								</div>
								<div>
									<div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
										{strings.paramSecondaryFiats}
									</div>
									<div className="flex flex-wrap gap-1.5">
										{WIDGET_CURRENCIES.filter((currency) => currency !== params.currency).map(
											(currency) => {
												const selected =
													params.secondaryFiats ?? defaultSecondaryFiats(params.currency)
												return (
													<Chip
														key={currency}
														active={selected.includes(currency)}
														onClick={() => {
															const current =
																params.secondaryFiats ??
																defaultSecondaryFiats(params.currency)
															const next = current.includes(currency)
																? current.filter((entry) => entry !== currency)
																: [...current, currency]
															patch({ secondaryFiats: next })
														}}
													>
														{currency}
													</Chip>
												)
											},
										)}
									</div>
								</div>
								<div>
									<div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
										{strings.paramCrypto}
									</div>
									<CoinPickerDropdown
										coins={pickableCoins}
										selected={params.cryptos ?? DEFAULT_CRYPTOS}
										onToggle={(symbol) => {
											const current = params.cryptos ?? DEFAULT_CRYPTOS
											const next = current.includes(symbol)
												? current.filter((entry) => entry !== symbol)
												: [...current, symbol]
											patch({ cryptos: next })
										}}
										limit={WIDGET_CRYPTO_LIMIT}
										searchPlaceholder={strings.paramCrypto}
										noMatch={strings.soon}
										align="left"
										triggerLabel={(count) => (
											<>
												<span className="font-mono uppercase">
													{(params.cryptos ?? DEFAULT_CRYPTOS).slice(0, 3).join(' · ') || '—'}
												</span>
												<span className="text-muted-foreground tabular-nums">
													{count}/{WIDGET_CRYPTO_LIMIT}
												</span>
											</>
										)}
									/>
								</div>
							</>
						)}
						<div>
							<div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
								{strings.paramLocale}
							</div>
							<div className="flex flex-wrap gap-1.5">
								{(Object.keys(LOCALE_LABELS) as WidgetLocale[]).map((lang) => (
									<Chip key={lang} active={locale === lang} onClick={() => setLocale(lang)}>
										{LOCALE_LABELS[lang]} {lang}
									</Chip>
								))}
							</div>
						</div>
						{type === 'price' && (
							<div>
								<div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
									{strings.paramRange}
								</div>
								<div className="flex flex-wrap gap-1.5">
									<Chip active={params.range === '24h'} onClick={() => patch({ range: '24h' })}>
										{strings.delta24h}
									</Chip>
									<Chip active={params.range === '7d'} onClick={() => patch({ range: '7d' })}>
										{strings.delta7d}
									</Chip>
								</div>
							</div>
						)}
						{type === 'market-cap' && (
							<div>
								<div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
									{strings.paramVariant}
								</div>
								<div className="flex flex-wrap gap-1.5">
									<Chip
										active={params.variant === 'normal'}
										onClick={() => patch({ variant: 'normal' })}
									>
										{strings.variantNormal}
									</Chip>
									<Chip active={params.variant === 'btc'} onClick={() => patch({ variant: 'btc' })}>
										{strings.variantBtc}
									</Chip>
								</div>
							</div>
						)}
						{(type === 'account' || type === 'donate') && (
							<div>
								<div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
									{strings.addressLabel}
								</div>
								<input
									type="text"
									value={address}
									onChange={(event) => setAddress(event.target.value.trim())}
									placeholder="nano_…"
									spellCheck={false}
									className={cn(
										'h-9 w-full rounded-sm border bg-muted/30 px-2 font-mono text-[10px] tracking-tight outline-none transition-colors placeholder:text-muted-foreground/40 focus:bg-muted/50',
										isValidNanoAddress(address)
											? 'border-border focus:border-[#209CE9]/70'
											: 'border-[#ea3943]/70 focus:border-[#ea3943]',
									)}
								/>
								<p className="mt-1 font-mono text-[8.5px] uppercase tracking-widest text-muted-foreground/50">
									{strings.addressHint}
								</p>
							</div>
						)}
						<div>
							<div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
								{strings.paramCompact}
							</div>
							<div className="flex flex-wrap gap-1.5">
								<Chip active={!params.compact} onClick={() => patch({ compact: false })}>
									{strings.paramCompactOff}
								</Chip>
								<Chip active={params.compact} onClick={() => patch({ compact: true })}>
									{strings.paramCompactOn}
								</Chip>
							</div>
						</div>
					</div>
				</section>

				{/* ---- Live output ---- */}
				<section className="relative flex min-w-0 flex-col rounded-md border border-border bg-card p-4 sm:p-5">
					<CornerTicks />
					<div className="flex flex-wrap items-center justify-between gap-2">
						<PanelLabel>{strings.outputLabel}</PanelLabel>
						<span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
							{strings.minWidth}
						</span>
					</div>

					<div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
						<div className="min-w-0 rounded-sm border border-border bg-muted/20 p-3">
							<div className="mb-2 flex items-center justify-between gap-2">
								<span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
									/ widget / embed / {locale} / {type}
								</span>
							</div>
							<iframe
								key={embedPath}
								src={embedPath}
								width="100%"
								height={previewHeight ?? height}
								title={`${strings[TYPE_KEYS[type].label]} — NanoMarketCap`}
								className="overflow-hidden"
							/>
						</div>

						<div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
							<div className="mb-2 flex items-center justify-between gap-2">
								<span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
									{strings.embedLabel}
								</span>
								<button
									type="button"
									onClick={copySnippet}
									className={cn(
										'flex cursor-pointer items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest transition-colors',
										copied
											? 'border-[#04b16e]/60 bg-[#04b16e]/10 text-[#04b16e]'
											: 'border-dashed border-border text-muted-foreground hover:border-[#209CE9]/50 hover:text-foreground',
									)}
								>
									{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
									{copied ? strings.copied : strings.copy}
								</button>
							</div>
							<pre className="code-scroll min-h-0 min-w-0 max-w-full flex-1 overflow-x-auto whitespace-pre rounded-sm border border-border bg-muted/30 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
								<code>
									<HighlightedSnippet code={snippet} />
								</code>
							</pre>
							<p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
								{strings.embedHint}
							</p>
						</div>
					</div>
				</section>
			</div>

			{/* ============ POLICY ============ */}
			<div
				className="animate-fade-in-up flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-[#209CE9]/30 bg-[#209CE9]/5 px-4 py-3 relative -z-10"
				style={{ animationDelay: '160ms' }}
			>
				<p className="flex items-center gap-3 text-sm text-muted-foreground">
					<span aria-hidden="true" className="font-mono text-base font-bold text-[#209CE9]">
						Ӿ
					</span>
					{strings.policy}
				</p>
			</div>
		</div>
	)
}
