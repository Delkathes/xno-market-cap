import Image, { type ImageProps } from 'next/image'
import type { MDXComponents } from 'mdx/types'

import { Link } from '@/i18n/navigation'

import { cn } from '@/lib/utils'

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

		...components,
	}
}
