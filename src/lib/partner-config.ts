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
		id: 'x402nano-org',
		enabled: true,
		partnerName: 'x402nano.org',
		title: 'x402nano.org: Feeless x402 Facilitator for Nano Payments',
		description:
			'Run x402 payment flows on Nano with no account required. Verify and settle HTTP 402 payments for APIs, apps, and AI agents in minutes.',
		logoUrl: '/partners/x402nano/x402-logo.svg',
		hasInternalPage: true,
		externalUrl: 'https://x402nano.org/',
	},
	// {
	// 	id: 'nano-gpt',
	// 	enabled: true,
	// 	partnerName: 'Nano-GPT',
	// 	title: 'Nano-GPT: Pay-as-You-Go AI with Nano',
	// 	description:
	// 		'Access GPT-4, Claude, Gemini, and more with flexible Nano payments. No subscriptions, just pay for what you use.',
	// 	logoUrl: '/partners/nano-gpt/nano-gpt.png',
	// 	hasInternalPage: true,
	// },
	// {
	// 	id: 'subnano',
	// 	enabled: true,
	// 	partnerName: 'SubNano',
	// 	title: 'SubNano: Get Paid When Readers Unlock Your Articles',
	// 	description:
	// 		'Monetize your writing with pay-per-article Nano payments. Instant earnings, zero fees, full audience ownership.',
	// 	logoUrl: '/partners/subnano/subnano.svg',
	// 	hasInternalPage: true,
	// },
	// {
	// 	id: 'rpc-nano-to',
	// 	enabled: true,
	// 	partnerName: 'RPC.Nano.To',
	// 	title: 'RPC.Nano.To: Production-Ready Nano Infrastructure',
	// 	description:
	// 		'Global RPC nodes, GPU proof-of-work, and developer APIs. Free tier with 50K calls/day to build instant payment apps.',
	// 	logoUrl: '/nano/badge-blue.svg',
	// 	hasInternalPage: true,
	// },
	// {
	// 	id: 'nanogotchi',
	// 	enabled: true,
	// 	partnerName: 'Nanogotchi',
	// 	title: 'Nanogotchi: Your Virtual Nano Pet',
	// 	description:
	// 		'Raise, breed, and trade digital pets powered by Nano. The blockchain tamagotchi bringing fun to cryptocurrency.',
	// 	logoUrl: '/partners/nanogotchi/nanogotchi.svg',
	// 	externalUrl: 'https://nanogotchi.com/',
	// },
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
