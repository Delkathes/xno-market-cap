import { cacheLife } from 'next/cache'

import { env } from '@/env'

// Compact, locale-stable count formatting for star/fork numbers
function formatCount(value: number): string {
	if (value >= 1e6) return `${(value / 1e6).toFixed(1).replace(/\.0$/, '')}M`
	if (value >= 1e3) return `${(value / 1e3).toFixed(1).replace(/\.0$/, '')}K`
	return String(value)
}

function formatRepoDate(iso: string): string {
	const date = new Date(iso)
	return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

// GitHub's official language color palette (subset, with a neutral fallback)
const LANGUAGE_COLORS: Record<string, string> = {
	TypeScript: '#3178c6',
	JavaScript: '#f1e05a',
	Python: '#3572a5',
	Go: '#00add8',
	Rust: '#dea584',
	Solidity: '#aa6746',
	C: '#555555',
	'C++': '#f34b7d',
	Java: '#b07219',
	Ruby: '#701516',
	PHP: '#4f5d95',
	HTML: '#e34c26',
	CSS: '#563d7c',
	Shell: '#89e051',
	Kotlin: '#a97bff',
	Swift: '#f05138',
	Zig: '#ec915c',
	Dart: '#00b4ab',
	CSharp: '#178600',
}
const DEFAULT_LANGUAGE_COLOR = '#8b949e'

interface OcticonProps {
	className?: string
}

// Minimal stroke-icon set (24px grid), consistent with the site's mono UI
function Icon({ className, children }: { className?: string; children: React.ReactNode }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			className={className}
		>
			{children}
		</svg>
	)
}

function StarIcon({ className }: OcticonProps) {
	return (
		<Icon className={className}>
			<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
		</Icon>
	)
}

function ForkIcon({ className }: OcticonProps) {
	return (
		<Icon className={className}>
			<circle cx="12" cy="18" r="3" />
			<circle cx="6" cy="6" r="3" />
			<circle cx="18" cy="6" r="3" />
			<path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" />
			<path d="M12 12v3" />
		</Icon>
	)
}

function ShieldIcon({ className }: OcticonProps) {
	return (
		<Icon className={className}>
			<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
		</Icon>
	)
}

function GithubIcon({ className }: OcticonProps) {
	return (
		<Icon className={className}>
			<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
			<path d="M9 18c-4.51 2-5-2-7-2" />
		</Icon>
	)
}

interface GitHubRepoInfo {
	full_name: string
	description: string | null
	stargazers_count: number
	forks_count: number
	language: string | null
	pushed_at: string
	archived: boolean
	license: { spdx_id: string | null } | null
	owner: {
		login: string
		avatar_url: string
		html_url: string
	}
}

interface GitHubUserInfo {
	name: string | null
	login: string
	html_url: string
	avatar_url: string
}

interface RepoCardData {
	repo: GitHubRepoInfo
	user: GitHubUserInfo | null
}

// Dev-only in-memory cache: 'use cache' is a no-op during development, and the
// unauthenticated GitHub API allows only 60 requests per hour.
const DEV_CACHE_TTL_MS = 10 * 60 * 1000
// Bump when RepoCardData changes shape so stale dev entries are invalidated.
const DEV_CACHE_VERSION = 'v2'

declare global {
	var __githubRepoCache: Map<string, { data: RepoCardData; expiresAt: number }> | undefined
}

async function fetchRepoInfo(repo: string): Promise<RepoCardData | null> {
	'use cache'
	cacheLife('days')

	if (!globalThis.__githubRepoCache) {
		globalThis.__githubRepoCache = new Map()
	}
	const devCache = globalThis.__githubRepoCache
	const devCacheKey = `${repo}#${DEV_CACHE_VERSION}`
	if (env.NODE_ENV === 'development') {
		const entry = devCache.get(devCacheKey)
		if (entry && entry.expiresAt > Date.now()) {
			return entry.data
		}
	}

	const headers = {
		Accept: 'application/vnd.github+json',
		'User-Agent': 'NanoMarketCap',
	}

	try {
		const [repoResponse, userResponse] = await Promise.all([
			fetch(`https://api.github.com/repos/${repo}`, { headers }),
			fetch(`https://api.github.com/users/${repo.split('/')[0]}`, { headers }),
		])

		if (!repoResponse.ok) {
			return null
		}

		const repoData: GitHubRepoInfo = await repoResponse.json()
		if (!repoData.full_name) {
			return null
		}

		let userData: GitHubUserInfo | null = null
		if (userResponse.ok) {
			const parsed = (await userResponse.json()) as Partial<GitHubUserInfo>
			if (parsed.login) {
				userData = {
					name: parsed.name ?? null,
					login: parsed.login,
					html_url: parsed.html_url ?? repoData.owner.html_url,
					avatar_url: parsed.avatar_url ?? repoData.owner.avatar_url,
				}
			}
		}

		const data: RepoCardData = { repo: repoData, user: userData }
		if (env.NODE_ENV === 'development') {
			devCache.set(devCacheKey, { data, expiresAt: Date.now() + DEV_CACHE_TTL_MS })
		}
		return data
	} catch {
		return null
	}
}

function RepoStat({ icon, value }: { icon: React.ReactNode; value: string }) {
	return (
		<div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-2">
			<span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
			<span className="font-mono text-sm font-bold leading-none tabular-nums">{value}</span>
		</div>
	)
}

// Server-rendered GitHub repository card — used in MDX as <GitHubRepo repo="owner/name" />.
// Fetches metadata + maintainer info from the GitHub API with long-lived caching
// and degrades to a name + link card if the API is unreachable.
export async function GitHubRepoCard({ repo }: { repo: string }) {
	const data = await fetchRepoInfo(repo)
	const info = data?.repo ?? null
	const repoUrl = `https://github.com/${repo}`

	const languageColor = info?.language ? (LANGUAGE_COLORS[info.language] ?? DEFAULT_LANGUAGE_COLOR) : null
	const licenseId = info?.license?.spdx_id ?? null

	let maintainer: { name: string; url: string; avatar: string } | null = null
	if (data?.user) {
		maintainer = {
			name: data.user.name ?? data.user.login,
			url: data.user.html_url,
			avatar: data.user.avatar_url,
		}
	} else if (info) {
		maintainer = { name: info.owner.login, url: info.owner.html_url, avatar: info.owner.avatar_url }
	}

	return (
		<div className="my-6 rounded-lg border border-border bg-card p-4">
			{/* Mini header */}
			<div className="flex items-start justify-between gap-1.5">
				{/* Identity row: repo on the left, maintainer aligned right on the same baseline */}

				<div className="flex items-start gap-4 mb-4">
					<div className="flex min-w-0 items-start gap-3">
						{info ? (
							// biome-ignore lint/performance/noImgElement: decorative repo owner avatar
							<img
								src={info.owner.avatar_url}
								alt=""
								className="h-10 w-10 my-0! shrink-0 rounded-md border border-border"
							/>
						) : (
							<div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border bg-muted text-[#209CE9]">
								<GithubIcon className="h-5 w-5" />
							</div>
						)}
						<div className="min-w-0">
							<a
								href={repoUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="block truncate font-mono text-sm font-bold transition-colors hover:text-[#209CE9]"
							>
								{info?.full_name ?? repo}
							</a>
							<span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
								{info ? `Updated ${formatRepoDate(info.pushed_at)}` : 'GitHub repository'}
							</span>
						</div>
					</div>

					{maintainer && (
						<div className="flex items-center gap-2">
							<span>by </span>{' '}
							<a
								href={maintainer.url}
								target="_blank"
								rel="noopener noreferrer"
								className="group flex shrink-0 items-center gap-2"
							>
								{/* biome-ignore lint/performance/noImgElement: maintainer avatar */}
								<img
									src={maintainer.avatar}
									alt=""
									className="h-6 w-6 my-0! rounded-full border border-border"
								/>
								<span className="truncate font-mono text-sm font-bold transition-colors group-hover:text-[#209CE9]">
									{maintainer.name}
								</span>
							</a>
						</div>
					)}
				</div>
				<div className="whitespace-nowrap flex">
					<GithubIcon className="h-3 w-3 text-muted-foreground mr-2" />
					<span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
						GitHub
					</span>
				</div>
			</div>

			{info?.description && <p className="mt-3 text-sm leading-6 text-muted-foreground">{info.description}</p>}

			{/* Stats */}
			{info && (
				<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
					<RepoStat
						icon={<StarIcon className="h-3.5 w-3.5 text-amber-400" />}
						value={formatCount(info.stargazers_count)}
					/>
					<RepoStat
						icon={<ForkIcon className="h-3.5 w-3.5 text-emerald-400" />}
						value={formatCount(info.forks_count)}
					/>
					<RepoStat
						icon={
							languageColor ? (
								<span
									className="h-2.5 w-2.5 shrink-0 rounded-full"
									style={{ backgroundColor: languageColor }}
								/>
							) : (
								<ShieldIcon className="h-3.5 w-3.5 text-muted-foreground" />
							)
						}
						value={info.language ?? '-'}
					/>
					<RepoStat icon={<ShieldIcon className="h-3.5 w-3.5 text-sky-400" />} value={licenseId ?? '-'} />
				</div>
			)}
		</div>
	)
}
