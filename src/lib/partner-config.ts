/**
 * Partner Content Configuration
 *
 * Update this file manually after receiving XNO payment from partners.
 * Add partners to the array - they will rotate automatically.
 */

export interface PartnerContent {
	/** Unique identifier / slug for this partner */
	id: string
	/** Whether to display this partner content */
	enabled: boolean
	/** Partner/company name */
	partnerName: string
	/** Headline for the spotlight */
	title: string
	/** Short description (1-2 sentences) */
	description: string
	/** Optional logo URL (recommended: 48x48 or similar square) */
	logoUrl?: string
	/** Optional start date (ISO string) - won't show before this date */
	startDate?: string
	/** Optional end date (ISO string) - won't show after this date */
	endDate?: string

	/**
	 * Link behavior - choose one:
	 * - externalUrl: Links to an external website
	 * - internalPage: Has a dedicated page at /partners/[id] with MDX content
	 */
	externalUrl?: string
	/** If true, this partner has a dedicated page at /partners/[id] */
	hasInternalPage?: boolean
}

/** Rotation interval in milliseconds */
export const PARTNER_ROTATION_INTERVAL = 6000 // 6 seconds

export const partnerConfig: PartnerContent[] = [
	{
		id: 'nanobrowser',
		enabled: true,
		partnerName: 'NanoBrowser',
		title: 'NanoBrowser: Earn Nano While You Browse',
		description:
			'The privacy-focused browser that rewards you with XNO for your attention. No tracking, no ads, just Nano.',
		logoUrl: '/nano/badge-blue.svg',
		hasInternalPage: true, // Has dedicated page at /partners/nanobrowser
	},
	{
		id: 'nanostore',
		enabled: true,
		partnerName: 'NanoStore',
		title: 'Shop With Nano - 10,000+ Products',
		description:
			'The largest marketplace accepting Nano payments. Electronics, clothing, gifts and more with instant checkout.',
		logoUrl: '/nano/badge-white.svg',
		externalUrl: 'https://example.com/nanostore',
	},
]

/**
 * Get the link for a partner (internal or external)
 */
export function getPartnerHref(partner: PartnerContent): string {
	if (partner.hasInternalPage) {
		return `/partners/${partner.id}`
	}
	return partner.externalUrl || '#'
}

/**
 * Check if partner links externally
 */
export function isExternalPartner(partner: PartnerContent): boolean {
	return !partner.hasInternalPage && !!partner.externalUrl
}

/**
 * Get a partner by ID
 */
export function getPartnerById(id: string): PartnerContent | undefined {
	return partnerConfig.find((s) => s.id === id)
}

/**
 * Get all partners with internal pages (for static generation)
 */
export function getPartnersWithPages(): PartnerContent[] {
	return partnerConfig.filter((s) => s.hasInternalPage)
}

/**
 * Get all currently active partners
 */
export function getActivePartners(config: PartnerContent[] = partnerConfig): PartnerContent[] {
	const now = new Date()

	return config.filter((partner) => {
		if (!partner.enabled) return false

		if (partner.startDate && new Date(partner.startDate) > now) {
			return false
		}

		if (partner.endDate && new Date(partner.endDate) < now) {
			return false
		}

		return true
	})
}
