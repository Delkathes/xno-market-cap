// XNO Circulating Supply (fixed supply, no inflation)
export const XNO_CIRCULATING_SUPPLY = 133246167.96530801

// Donation configuration
export const DONATION_GOAL_XNO = 50000

export const DONATION_GOAL_REACHED = process.env.NEXT_PUBLIC_DONATION_GOAL_REACHED === 'true'

export const ALLOWED_GOAL_ORIGINS = [
	/^https:\/\/.*\.vercel\.app$/,
	/^https:\/\/.*\.netlify\.app$/,
	/^http:\/\/localhost(:\d+)?$/,
	/^http:\/\/127\.0\.0\.1(:\d+)?$/,
]
