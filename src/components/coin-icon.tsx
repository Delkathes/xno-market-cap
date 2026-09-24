import coinIconHashes from '@/lib/coin-icons.json'

const ICON_HASHES = coinIconHashes as Record<string, string>

interface CoinIconProps {
	id: string
	image: string
	alt: string
	width?: number
	height?: number
	className?: string
	priority?: boolean
}

// Icons are mirrored into public/coins by scripts/generate-coin-icons.mjs, with a
// hash of the upstream URL baked into each filename so they can be served
// immutable. Coins missing from the manifest (new listings since the last run)
// fall back to the upstream CDN URL so nothing renders broken.
export function CoinIcon({ id, image, alt, width = 32, height = 32, className, priority }: CoinIconProps) {
	const hash = ICON_HASHES[id]

	if (!hash) {
		if (!image) return null
		return (
			// biome-ignore lint/performance/noImgElement: upstream fallback for coins not yet mirrored
			<img
				src={image}
				alt={alt}
				width={width}
				height={height}
				className={className}
				loading={priority ? 'eager' : 'lazy'}
				decoding="async"
				fetchPriority={priority ? 'high' : undefined}
			/>
		)
	}

	const base = `/coins/${id}-${hash}`

	return (
		// biome-ignore lint/performance/noImgElement: pre-sized locally mirrored webp
		<img
			src={`${base}-64.webp`}
			srcSet={`${base}-64.webp 1x, ${base}-96.webp 2x`}
			alt={alt}
			width={width}
			height={height}
			className={className}
			loading={priority ? 'eager' : 'lazy'}
			decoding="async"
			fetchPriority={priority ? 'high' : undefined}
		/>
	)
}
