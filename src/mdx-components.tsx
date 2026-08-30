import Image, { type ImageProps } from 'next/image'
import type { ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'

import { Link } from '@/i18n/navigation'

import { cn } from '@/lib/utils'

import { ArticleChart } from '@/components/article-chart'
import { ArticleTicker } from '@/components/article-ticker'
import { GitHubRepoCard } from '@/components/github-repo-card'

// =============================================================================
// Article building blocks
// =============================================================================

type CalloutType = 'info' | 'insight' | 'warning'

const CALLOUT_STYLES: Record<CalloutType, string> = {
	info: 'border-primary/30 bg-primary/5',
	insight: 'border-[#209CE9]/40 bg-[#209CE9]/[0.06]',
	warning: 'border-amber-500/40 bg-amber-500/5',
}

function Callout({
	type = 'info',
	title,
	children,
	className,
}: {
	type?: CalloutType
	title?: string
	children?: ReactNode
	className?: string
}) {
	return (
		<div
			className={cn(
				'relative my-6 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground',
				CALLOUT_STYLES[type],
				className,
			)}
		>
			<span aria-hidden="true" className="absolute -top-1.5 -left-2 h-3 w-3 rounded-full bg-card" />
			<span aria-hidden="true" className="absolute -top-1.5 -right-2 h-3 w-3 rounded-full bg-card" />
			{title && (
				<p
					className={cn(
						'font-mono text-[10px] font-semibold uppercase tracking-[0.22em]',
						type === 'warning' ? 'text-amber-500' : type === 'insight' ? 'text-[#209CE9]' : 'text-primary',
					)}
				>
					{title}
				</p>
			)}
			<div className="mt-1 leading-6 [&_p:last-child]:mb-0">{children}</div>
		</div>
	)
}

function StatGrid({ children, className }: { children?: ReactNode; className?: string }) {
	return <div className={cn('my-6 grid grid-cols-2 gap-2 sm:grid-cols-3', className)}>{children}</div>
}

function Stat({
	label,
	value,
	accent = false,
	className,
}: {
	label: string
	value: string
	accent?: boolean
	className?: string
}) {
	return (
		<div
			className={cn(
				'rounded-md border border-border bg-muted/30 px-3 py-2.5',
				accent && 'border-[#209CE9]/40 bg-[#209CE9]/[0.07]',
				className,
			)}
		>
			<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
			<p
				className={cn(
					'mt-1 font-mono text-base font-bold leading-snug tabular-nums tracking-tight wrap-break-word',
					accent ? 'text-[#209CE9]' : 'text-foreground',
				)}
			>
				{value}
			</p>
		</div>
	)
}

function Terminal({ title, children, className }: { title?: string; children?: ReactNode; className?: string }) {
	return (
		<div className={cn('my-6 overflow-hidden rounded-lg border border-border bg-muted/40', className)}>
			<div className="flex items-center gap-1.5 border-b border-border bg-muted/70 px-3 py-2">
				<span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
				<span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
				<span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
				{title && (
					<span className="ml-2 truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
						{title}
					</span>
				)}
			</div>
			<div className="overflow-x-auto p-4 font-mono text-sm leading-6 whitespace-pre-wrap [&_p]:my-0 [&_p]:whitespace-pre-wrap">
				{children}
			</div>
		</div>
	)
}

function Steps({ title, children, className }: { title?: string; children?: ReactNode; className?: string }) {
	return (
		<div className={cn('my-6', className)}>
			{title && (
				<p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{title}</p>
			)}
			<ol className="space-y-4">{children}</ol>
		</div>
	)
}

interface BarChartItem {
	label: string
	value: number
	accent?: boolean
}

// Static scenario bar chart (log-scaled bar widths) for authored, hypothetical data.
function BarChart({
	title,
	footnote,
	data,
	unit = '$',
	className,
}: {
	title?: string
	footnote?: string
	data: BarChartItem[]
	unit?: string
	className?: string
}) {
	const max = Math.max(...data.map((item) => item.value))

	return (
		<div className={cn('my-6 rounded-md border border-border bg-card p-4', className)}>
			{title && (
				<p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{title}</p>
			)}
			<div className="space-y-2">
				{data.map((item) => {
					const width = Math.max(3, (Math.log10(item.value) / Math.log10(max)) * 100)
					return (
						<div key={item.label} className="flex items-center gap-3">
							<span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">{item.label}</span>
							<div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-muted">
								<div
									className={cn(
										'h-full rounded-sm',
										item.accent ? 'bg-[#209CE9]' : 'bg-[#209CE9]/50',
									)}
									style={{ width: `${width}%` }}
								/>
							</div>
							<span
								className={cn(
									'w-20 shrink-0 text-right font-mono text-sm font-bold tabular-nums',
									item.accent ? 'text-[#209CE9]' : 'text-foreground',
								)}
							>
								{unit}
								{Number.isInteger(item.value) ? item.value : item.value.toFixed(2)}
							</span>
						</div>
					)
				})}
			</div>
			{footnote && (
				<p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
					{footnote}
				</p>
			)}
		</div>
	)
}

function Step({ index, title, children }: { index: string; title?: string; children?: ReactNode }) {
	return (
		<li className="relative flex gap-4 pb-5 last:pb-0 before:absolute before:top-8 before:bottom-0 before:left-4 before:w-px before:border-l before:border-dashed before:border-border last:before:hidden">
			<span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-card font-mono text-xs font-bold text-[#209CE9]">
				{index}
			</span>
			<div className="min-w-0 flex-1">
				{title && <p className="font-semibold text-foreground">{title}</p>}
				<div className="mt-1 text-sm leading-6 text-muted-foreground">{children}</div>
			</div>
		</li>
	)
}

/**
 * Embeddable NanoMarketCap widget (the /widgets/embed/* pages). Mirrors the
 * builder's generated snippet: a centered iframe at most 460px wide, with
 * the fixed height as a no-JS fallback (widgets/embed.js auto-fits it).
 * MDX compiles attributes to JSX props, so the style must be an object, not
 * the snippet's string form.
 */
function WidgetEmbed({
	src,
	height = 228,
	title = 'NanoMarketCap widget',
	className,
}: {
	src: string
	height?: number
	title?: string
	className?: string
}) {
	return (
		<div className={cn('my-6', className)}>
			<iframe
				src={src}
				loading="lazy"
				width="100%"
				height={height}
				title={title}
				style={{
					border: 0,
					overflow: 'hidden',
					maxWidth: 'min(460px, 100vw)',
					marginInline: 'auto',
					display: 'block',
				}}
			/>
		</div>
	)
}

function Figure({
	src,
	alt,
	caption,
	className,
	...props
}: {
	src: string
	alt: string
	caption?: string
	className?: string
} & Omit<ImageProps, 'src' | 'alt'>) {
	// next/image requires explicit dimensions; fall back to a plain img when the
	// author did not provide them (e.g. screenshots with unknown dimensions).
	const hasDimensions = props.width !== undefined && props.height !== undefined
	const {
		width: _width,
		height: _height,
		sizes: _sizes,
		unoptimized: _unoptimized,
		priority: _priority,
		...imgProps
	} = props

	return (
		<figure className={cn('my-6', className)}>
			{hasDimensions ? (
				<Image
					src={src}
					alt={alt}
					sizes="100vw"
					className="rounded-lg"
					unoptimized
					style={{ width: '100%', height: 'auto' }}
					{...props}
				/>
			) : (
				// biome-ignore lint/performance/noImgElement: author figures without explicit dimensions
				<img
					src={src}
					alt={alt}
					className="rounded-lg"
					style={{ width: '100%', height: 'auto' }}
					{...imgProps}
				/>
			)}
			{caption && (
				<figcaption className="mt-2 font-mono text-[11px] text-muted-foreground">
					<span aria-hidden="true" className="mr-2 text-[#209CE9]">
						{'//'}
					</span>
					{caption}
				</figcaption>
			)}
		</figure>
	)
}

// =============================================================================
// Global MDX component mapping
// =============================================================================

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		// Headings
		h1: ({ children, className, ...props }) => (
			<h1 className={cn('mt-8 mb-4 text-3xl font-bold tracking-tight', className)} {...props}>
				{children}
			</h1>
		),
		h2: ({ children, className, ...props }) => (
			<h2 className={cn('mt-8 mb-3 text-2xl font-semibold tracking-tight', className)} {...props}>
				{children}
			</h2>
		),
		h3: ({ children, className, ...props }) => (
			<h3 className={cn('mt-6 mb-2 text-xl font-semibold', className)} {...props}>
				{children}
			</h3>
		),

		// Paragraphs and text
		p: ({ children, className, ...props }) => (
			<p className={cn('mb-4 leading-7 text-foreground/90', className)} {...props}>
				{children}
			</p>
		),
		strong: ({ children, className, ...props }) => (
			<strong className={cn('font-semibold text-foreground', className)} {...props}>
				{children}
			</strong>
		),
		em: ({ children, className, ...props }) => (
			<em className={cn('italic', className)} {...props}>
				{children}
			</em>
		),

		// Links
		a: ({ href, children, className, ...props }) => {
			const isExternal = href?.startsWith('http')
			if (isExternal) {
				return (
					<a
						href={href}
						className={cn('text-primary underline underline-offset-4 hover:text-primary/80', className)}
						target="_blank"
						rel="noopener noreferrer"
						{...props}
					>
						{children}
					</a>
				)
			}
			return (
				<Link
					href={href ?? '/'}
					className={cn('text-primary underline underline-offset-4 hover:text-primary/80', className)}
					{...props}
				>
					{children}
				</Link>
			)
		},

		// Lists
		ul: ({ children, className, ...props }) => (
			<ul className={cn('mb-4 ml-6 list-disc space-y-2', className)} {...props}>
				{children}
			</ul>
		),
		ol: ({ children, className, ...props }) => (
			<ol className={cn('mb-4 ml-6 list-decimal space-y-2', className)} {...props}>
				{children}
			</ol>
		),
		li: ({ children, className, ...props }) => (
			<li className={cn('leading-7', className)} {...props}>
				{children}
			</li>
		),

		// Blockquote
		blockquote: ({ children, className, ...props }) => (
			<blockquote
				className={cn('mt-4 mb-4 border-l-4 border-primary/50 pl-4 italic text-muted-foreground', className)}
				{...props}
			>
				{children}
			</blockquote>
		),

		// Code
		code: ({ children, className, ...props }) => (
			<code
				className={cn('rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground', className)}
				{...props}
			>
				{children}
			</code>
		),
		pre: ({ children, className, ...props }) => (
			<pre className={cn('mb-4 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm', className)} {...props}>
				{children}
			</pre>
		),

		// Horizontal rule
		hr: ({ className, ...props }) => <hr className={cn('my-8 border-border', className)} {...props} />,

		// Images
		img: (props) => (
			<Image
				sizes="100vw"
				style={{ width: '100%', height: 'auto' }}
				className="rounded-lg my-4"
				unoptimized
				{...(props as ImageProps)}
			/>
		),

		// Table (basic support)
		table: ({ children, className, ...props }) => (
			<div className="mb-4 overflow-x-auto">
				<table className={cn('w-full border-collapse text-sm', className)} {...props}>
					{children}
				</table>
			</div>
		),
		th: ({ children, className, ...props }) => (
			<th className={cn('border border-border bg-muted px-4 py-2 text-left font-semibold', className)} {...props}>
				{children}
			</th>
		),
		td: ({ children, className, ...props }) => (
			<td className={cn('border border-border px-4 py-2', className)} {...props}>
				{children}
			</td>
		),

		// Custom article building blocks
		Callout,
		StatGrid,
		Stat,
		Terminal,
		Steps,
		Step,
		Figure,
		BarChart,
		WidgetEmbed,
		Ticker: ArticleTicker,
		Chart: ArticleChart,
		GitHubRepo: GitHubRepoCard,

		...components,
	}
}
