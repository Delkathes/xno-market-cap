import type { Metadata } from 'next'
import type { ComponentType } from 'react'
import {
	ArrowLeftRight,
	BookOpen,
	Bot,
	ChevronDown,
	Code2,
	Coins,
	Compass,
	Cpu,
	CreditCard,
	ExternalLink,
	FileCode,
	Globe,
	Layers,
	Leaf,
	Network,
	Package,
	ShieldCheck,
	Smartphone,
	TrendingDown,
	Users,
	Workflow,
	Zap,
} from 'lucide-react'
import { setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { Button } from '@/components/ui/button'
import { AnimatedTerminal } from '@/components/why-nano/animated-terminal'
import { AnimatedWorkflow } from '@/components/why-nano/animated-workflow'

export const metadata: Metadata = {
	title: 'Why Nano? The Currency for AI | NanoMarketCap',
	description:
		'Discover why Nano (XNO) is the best currency for AI agents: feeless micro-payments, instant settlement, and the x402 protocol.',
}

type Props = {
	params: Promise<{ locale: string }>
}

export default async function WhyNanoPage({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)

	return (
		<main className="relative container mx-auto px-4 pt-28 pb-24 selection:bg-cyan-500/30">
			{/* Background Effects */}
			<div className="fixed inset-0 z-0 pointer-events-none animate-in fade-in duration-500">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#9f9f9f2e_1px,transparent_1px),linear-gradient(to_bottom,#9f9f9f2e_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]  bg-size-[50px_50px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-125 bg-cyan-500/10 dark:bg-cyan-500/12.5 blur-[120px] rounded-full mix-blend-screen" />
				<div className="absolute bottom-0 right-0 w-200 h-150 bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen" />
			</div>

			{/* Hero Section */}
			<div className="relative z-10 text-center mb-32">
				<h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
					The Payment Layer for{' '}
					<span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-blue-500">
						Autonomous Machines
					</span>
				</h1>
				<p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-2">
					Nano is the only currency with zero fees, sub-second finality, and no smart-contract complexity —
					purpose-built for the machine economy where AI agents transact autonomously.
				</p>
				<p className="text-muted-foreground max-w-2xl mx-auto mb-6">
					From per-token LLM billing to the x402 payment protocol, Nano gives agents a frictionless value
					layer that traditional finance and blockchain networks cannot match.
				</p>
				<div className="flex items-center justify-center gap-4">
					<Button variant="outline" asChild>
						<a href="https://nano.org" target="_blank" rel="noopener noreferrer">
							Learn About Nano <ExternalLink className="w-4 h-4 ml-2" />
						</a>
					</Button>
				</div>
			</div>

			{/* Bento Grid Features */}
			<section className="relative z-10 max-w-6xl mx-auto mb-32">
				<div className="flex flex-col items-center mb-12 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold">Why Agents Choose Nano</h2>
					<p className="text-muted-foreground max-w-xl text-center">
						Optimized for high-frequency, low-latency, autonomous transactions.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-[minmax(160px,auto)]">
					{/* Key Feature - Large */}
					<div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-7 hover:border-cyan-500/40 dark:hover:border-cyan-500/30 transition-all duration-500 order-1">
						<div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 dark:from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10 h-full flex flex-col gap-5">
							<div className="flex items-center">
								<div className="w-12 h-12 mr-4 rounded-xl bg-cyan-100 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-500">
									<Zap className="w-6 h-6" />
								</div>
								<h3 className="text-lg sm:text-xl md:text-2xl font-bold">Instant Feeless Settlement</h3>
							</div>
							<div className="flex flex-col justify-between h-full space-y-3 sm:space-y-2 md:space-y-0 text-sm sm:text-base">
								<p className="text-muted-foreground leading-relaxed max-w-2xl">
									<strong className="text-foreground">Instant:</strong> Nano settles in under 500ms —
									agents don't wait for block confirmations. Real-time value transfer for real-time
									inference, API calls, and autonomous decision-making.
								</p>
								<p className="text-muted-foreground leading-relaxed max-w-2xl">
									<strong className="text-foreground">Feeless:</strong> Send $0.000001 economically.
									Every micro-payment is viable — perfect for per-token LLM billing, streaming compute
									costs, and pay-per-tool usage.
								</p>
								<p className="text-muted-foreground leading-relaxed max-w-2xl">
									<strong className="text-foreground">Decentralized:</strong> No central authority can
									freeze funds or censor transactions. Agents operate with full financial autonomy,
									guaranteed by decentralized consensus.
								</p>
							</div>
						</div>
					</div>

					<BentoCard
						icon={Bot}
						title="Agent Native"
						description="Simple light-weight RPCs. No complex smart contracts to audit, no gas to estimate, no nonces to manage."
						accentColor="orange"
					/>

					<BentoCard
						icon={Network}
						title="x402 Protocol"
						description="The HTTP standard for payment-required resources. Agents can autonomously pay/charge for any API, data feed, or tool access."
						accentColor="blue"
					/>

					{/* Feature 4 - Wide */}
					<div className="md:col-span-2 relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-7 hover:border-green-500/40 dark:hover:border-green-500/30 transition-all duration-500 order-5 sm:order-3">
						<div className="absolute inset-0 bg-linear-to-r from-green-500/5 dark:from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="flex flex-col gap-5">
							<div className="flex items-center gap-4">
								<div className="w-11 h-11 rounded-lg bg-green-100 dark:bg-green-950/50 border border-green-200 dark:border-green-500/20 flex items-center justify-center shrink-0 text-green-600 dark:text-green-400">
									<Leaf className="w-5 h-5" />
								</div>
								<h3 className="text-lg font-bold">Sustainable Compute</h3>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">
									AI training is energy intensive — payments shouldn't be. Nano consumes negligible
									energy per transaction and adds zero carbon footprint to your stack.
								</p>
							</div>
						</div>
					</div>

					<BentoCard
						icon={Coins}
						title="MCP Integration"
						description="Provides direct access to Nano RPCs. AI agents can query balances, send transactions, and monitor the network programmatically."
						accentColor="purple"
					/>
				</div>
			</section>

			{/* Use Cases — Terminal Look */}
			<section className="relative z-10 max-w-4xl mx-auto mb-32">
				<div className="flex flex-col items-center mb-10 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold">x402 in Action</h2>
					<p className="text-muted-foreground max-w-xl text-center">
						How AI agents pay for resources in real time using the HTTP 402 protocol and Nano.
					</p>
				</div>

				<AnimatedTerminal />
			</section>

			{/* n8n-style Workflow */}
			<section className="relative z-10 max-w-5xl mx-auto mb-32">
				<div className="flex flex-col items-center mb-10 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold">Workflow Automation</h2>
					<p className="text-muted-foreground max-w-xl text-center">
						Integrate Nano into n8n workflows, automate feeless payment workflows.
					</p>
				</div>

				<AnimatedWorkflow />
			</section>

			{/* How It Works */}
			<section className="relative z-10 max-w-5xl mx-auto mb-32">
				<div className="flex flex-col items-center mb-14 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold">How Nano Works</h2>
					<p className="text-muted-foreground max-w-xl text-center">
						A unique architecture designed for instant, feeless value transfer.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
					{/* Connector line — desktop only */}
					<div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-linear-to-r from-cyan-500/40 via-blue-500/40 to-purple-500/40" />

					{/* Step 1 */}
					<div className="flex flex-col items-center text-center">
						<div className="z-10 w-24 h-24 rounded-2xl bg-cyan-100 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-5">
							<Layers className="w-10 h-10" />
						</div>
						<span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">
							Step 1
						</span>
						<h3 className="text-lg font-bold mb-2">Your Own Blockchain</h3>
						<p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
							Every account has its own blockchain (account-chain). No shared state, no contention, no
							bottlenecks — unlimited throughput by design.
						</p>
					</div>

					{/* Step 2 */}
					<div className="flex flex-col items-center text-center">
						<div className="z-10 w-24 h-24 rounded-2xl bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5">
							<ArrowLeftRight className="w-10 h-10" />
						</div>
						<span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
							Step 2
						</span>
						<h3 className="text-lg font-bold mb-2">Asynchronous Transfers</h3>
						<p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
							Transactions split into independent send and receive blocks. Both parties act on their own
							chain — no waiting for the other side.
						</p>
					</div>

					{/* Step 3 */}
					<div className="flex flex-col items-center text-center">
						<div className="z-10 w-24 h-24 rounded-2xl bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-5">
							<ShieldCheck className="w-10 h-10" />
						</div>
						<span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
							Step 3
						</span>
						<h3 className="text-lg font-bold mb-2">Instant Consensus</h3>
						<p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
							Open Representative Voting (ORV) confirms transactions in under 1 second. No mining, no
							staking — just lightweight voting with minimal energy.
						</p>
					</div>
				</div>
			</section>

			{/* Comparison Table */}
			<section className="relative z-10 max-w-4xl mx-auto mb-32">
				<h2 className="text-2xl md:text-3xl font-bold text-center mb-10">How Nano Compares</h2>

				<div className="grid grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
					{/* Header */}
					<div className="bg-muted p-3 md:p-5 flex items-center">
						<span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
							Metric
						</span>
					</div>
					<div className="bg-muted p-3 md:p-5 flex items-center justify-center relative overflow-hidden">
						<div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
						<span className="text-cyan-600 dark:text-cyan-400 font-bold text-xs md:text-base">
							Nano (XNO)
						</span>
					</div>
					<div className="bg-muted p-3 md:p-5 flex items-center justify-center">
						<span className="text-muted-foreground font-semibold text-xs md:text-base">Bitcoin</span>
					</div>
					<div className="bg-muted p-3 md:p-5 flex items-center justify-center">
						<span className="text-muted-foreground font-semibold text-xs md:text-base">Tether (USDT)</span>
					</div>

					{/* Latency */}
					<div className="bg-card p-3 md:p-5 flex items-center">
						<span className="font-medium text-sm">Latency</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="font-mono text-sm">&lt; 1s</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="text-muted-foreground font-mono text-sm">10 – 60 min</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="text-muted-foreground font-mono text-sm">1 – 30s</span>
					</div>

					{/* Cost */}
					<div className="bg-card p-3 md:p-5 flex items-center">
						<span className="font-medium text-sm">Tx Fees</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="font-mono text-sm">None</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="text-muted-foreground font-mono text-sm">$1 – $50</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="text-muted-foreground font-mono text-sm">$0.02 – $3</span>
					</div>

					{/* Architecture */}
					<div className="bg-card p-3 md:p-5 flex items-center">
						<span className="font-medium text-sm">Architecture</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="font-mono text-center text-xs md:text-sm">
							Async
							<br />
							Block Lattice
						</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="text-muted-foreground font-mono text-center text-xs md:text-sm">
							PoW
							<br />
							Blockchain
						</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="text-muted-foreground font-mono text-center text-xs md:text-sm">
							Centralized
							<br />
							Token
						</span>
					</div>

					{/* Energy */}
					<div className="bg-card p-3 md:p-5 flex items-center">
						<span className="font-medium text-sm">Energy / Tx</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="font-mono text-sm">0.111 Wh</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="text-muted-foreground font-mono text-sm">707 kWh</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="text-muted-foreground font-mono text-sm">Host chain</span>
					</div>

					{/* Availability */}
					<div className="bg-card p-3 md:p-5 flex items-center">
						<span className="font-medium text-sm">Availability</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="font-mono text-sm">24/7</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="text-muted-foreground font-mono text-sm">24/7</span>
					</div>
					<div className="bg-card p-3 md:p-5 flex items-center justify-center">
						<span className="text-muted-foreground font-mono text-center text-xs md:text-sm">
							24/7, censurable
						</span>
					</div>
				</div>
			</section>

			{/* Supply & Distribution */}
			<section className="relative z-10 max-w-4xl mx-auto mb-32">
				<div className="flex flex-col items-center mb-12 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold">Supply &amp; Distribution</h2>
					<p className="text-muted-foreground max-w-xl text-center">
						Fair, fixed, and fully distributed from day one.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
					<div className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-7 hover:border-cyan-500/40 dark:hover:border-cyan-500/30 transition-all duration-300 text-center">
						<div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 dark:from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="w-12 h-12 mx-auto rounded-xl bg-cyan-100 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
								<Coins className="w-6 h-6" />
							</div>
							<div className="text-3xl font-bold mb-1">{(133248297).toLocaleString()}</div>
							<div className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mb-2">
								Fixed Supply
							</div>
							<p className="text-muted-foreground text-sm">
								The total number of XNO that will ever exist. Defined at genesis, immutable forever.
							</p>
						</div>
					</div>

					<div className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-7 hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300 text-center">
						<div className="absolute inset-0 bg-linear-to-br from-blue-500/5 dark:from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="w-12 h-12 mx-auto rounded-xl bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
								<Users className="w-6 h-6" />
							</div>
							<div className="text-3xl font-bold mb-1">100%</div>
							<div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
								Fully Distributed
							</div>
							<p className="text-muted-foreground text-sm">
								All XNO distributed via a free CAPTCHA faucet. No ICO, no pre-mine, no insider
								allocation.
							</p>
						</div>
					</div>

					<div className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-7 hover:border-green-500/40 dark:hover:border-green-500/30 transition-all duration-300 text-center">
						<div className="absolute inset-0 bg-linear-to-br from-green-500/5 dark:from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="w-12 h-12 mx-auto rounded-xl bg-green-100 dark:bg-green-950/50 border border-green-200 dark:border-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
								<TrendingDown className="w-6 h-6" />
							</div>
							<div className="text-3xl font-bold mb-1">0%</div>
							<div className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
								Zero Inflation
							</div>
							<p className="text-muted-foreground text-sm">
								No new XNO can ever be created. No inflation, no dilution — your share of the supply is
								permanent.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Beyond AI */}
			<section className="relative z-10 max-w-6xl mx-auto mb-32">
				<div className="flex flex-col items-center mb-12 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold">Beyond AI</h2>
					<p className="text-muted-foreground max-w-xl text-center">
						Nano isn&apos;t just for machines — it&apos;s a universal currency for anyone who values speed,
						simplicity, and zero fees.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
					<div className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 hover:border-cyan-500/40 dark:hover:border-cyan-500/30 transition-all duration-300">
						<div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 dark:from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="flex items-center mb-3">
								<div className="flex-none w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
									<CreditCard className="w-5 h-5" />
								</div>
								<h3 className="ml-3 text-base font-bold">P2P Payments</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Send value to anyone, anywhere, instantly and without fees.
							</p>
						</div>
					</div>

					<div className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300">
						<div className="absolute inset-0 bg-linear-to-br from-blue-500/5 dark:from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="flex items-center mb-3">
								<div className="flex-none w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
									<Globe className="w-5 h-5" />
								</div>
								<h3 className="ml-3 text-base font-bold">Global Access</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Skip correspondent banks. Settle internationally in under a second.
							</p>
						</div>
					</div>

					<div className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 hover:border-purple-500/40 dark:hover:border-purple-500/30 transition-all duration-300">
						<div className="absolute inset-0 bg-linear-to-br from-purple-500/5 dark:from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="flex items-center mb-3">
								<div className="flex-none w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
									<Smartphone className="w-5 h-5" />
								</div>
								<h3 className="ml-3 text-base font-bold">Point of Sale</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Accept payments with zero processing fees and instant confirmation.
							</p>
						</div>
					</div>

					<div className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 hover:border-orange-500/40 dark:hover:border-orange-500/30 transition-all duration-300">
						<div className="absolute inset-0 bg-linear-to-br from-orange-500/5 dark:from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="flex items-center mb-3">
								<div className="flex-none w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
									<Cpu className="w-5 h-5" />
								</div>
								<h3 className="text-base font-bold ml-3 whitespace-nowrap">IoT Micropayments</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Machines paying machines — sensors, meters, and devices transacting autonomously.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Developer Resources */}
			<section className="relative z-10 max-w-5xl mx-auto mb-32">
				<div className="flex flex-col items-center mb-12 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold">Developer Resources</h2>
					<p className="text-muted-foreground max-w-xl text-center">
						Everything you need to start building with Nano.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
					<a
						href="https://docs.nano.org"
						target="_blank"
						rel="noopener noreferrer"
						className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 hover:border-cyan-500/40 dark:hover:border-cyan-500/30 transition-all duration-300"
					>
						<div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 dark:from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center">
									<div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
										<BookOpen className="w-5 h-5" />
									</div>
									<h3 className="ml-3 text-base font-bold">Nano Docs</h3>
								</div>
								<ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-cyan-500 transition-colors" />
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Official protocol documentation, RPC reference, and integration guides.
							</p>
						</div>
					</a>

					<a
						href="https://github.com/x402nano"
						target="_blank"
						rel="noopener noreferrer"
						className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300"
					>
						<div className="absolute inset-0 bg-linear-to-br from-blue-500/5 dark:from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center">
									<div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
										<Code2 className="w-5 h-5" />
									</div>
									<h3 className="ml-3 text-base font-bold">x402 Nano</h3>
								</div>
								<ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Reference implementation for x402 payment protocol integration with Nano.
							</p>
						</div>
					</a>

					<a
						href="https://github.com/infinitybay/nano-sdk"
						target="_blank"
						rel="noopener noreferrer"
						className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 hover:border-purple-500/40 dark:hover:border-purple-500/30 transition-all duration-300"
					>
						<div className="absolute inset-0 bg-linear-to-br from-purple-500/5 dark:from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center">
									<div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
										<FileCode className="w-5 h-5" />
									</div>
									<h3 className="ml-3 text-base font-bold">Nano SDK</h3>
								</div>
								<ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								TypeScript SDK for Nano RPC commands with full type safety and IntelliSense.
							</p>
						</div>
					</a>

					<a
						href="https://github.com/marvinroger/nanocurrency-js/tree/master/packages/nanocurrency"
						target="_blank"
						rel="noopener noreferrer"
						className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 hover:border-orange-500/40 dark:hover:border-orange-500/30 transition-all duration-300"
					>
						<div className="absolute inset-0 bg-linear-to-br from-orange-500/5 dark:from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center">
									<div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
										<Package className="w-5 h-5" />
									</div>
									<h3 className="ml-3 text-base font-bold">TS Nanocurrency</h3>
								</div>
								<ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Comprehensive JavaScript/TypeScript toolkit for Nano development.
							</p>
						</div>
					</a>

					<a
						href="https://nano.casa/"
						target="_blank"
						rel="noopener noreferrer"
						className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 hover:border-green-500/40 dark:hover:border-green-500/30 transition-all duration-300"
					>
						<div className="absolute inset-0 bg-linear-to-br from-green-500/5 dark:from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center">
									<div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950/50 border border-green-200 dark:border-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
										<Compass className="w-5 h-5" />
									</div>
									<h3 className="ml-3 text-base font-bold">Nano Casa</h3>
								</div>
								<ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-green-500 transition-colors" />
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Track development activity and discover projects across the Nano ecosystem.
							</p>
						</div>
					</a>
				</div>

				{/* Coming Soon */}
				<div className="space-y-3">
					<div className="flex items-center gap-2 mb-4">
						<div className="h-px flex-1 bg-border" />
						<span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
							Coming Soon
						</span>
						<div className="h-px flex-1 bg-border" />
					</div>

					<div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card/30 backdrop-blur-xl p-6 opacity-60">
						<div className="flex items-start gap-4">
							<div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0">
								<Workflow className="w-5 h-5" />
							</div>
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<h3 className="text-base font-bold">n8n Community Node</h3>
									<span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full border border-cyan-500/20 whitespace-nowrap">
										In Development
									</span>
								</div>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Official n8n community node for Nano RPC commands. Build visual workflows with
									native Nano integration.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="relative z-10 max-w-3xl mx-auto mb-32">
				<div className="flex flex-col items-center mb-12 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold">Frequently Asked Questions</h2>
				</div>

				<div className="space-y-3">
					<details className="group rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
						<summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 [&::-webkit-details-marker]:hidden">
							Is Nano really feeless?
							<ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
						</summary>
						<div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
							Yes. There are no transaction fees of any kind. Nano uses a lightweight, client-side proof
							of work to rate-limit spam — but this costs the sender nothing. Every raw unit you send is
							exactly what the recipient receives.
						</div>
					</details>

					<details className="group rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
						<summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 [&::-webkit-details-marker]:hidden">
							How fast is Nano?
							<ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
						</summary>
						<div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
							Typical transactions confirm in under 1 second. Nano&apos;s block-lattice architecture and
							Open Representative Voting (ORV) consensus eliminate the need for mining or block intervals,
							allowing near-instant finality.
						</div>
					</details>

					<details className="group rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
						<summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 [&::-webkit-details-marker]:hidden">
							What is x402?
							<ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
						</summary>
						<div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
							x402 is a protocol built on the HTTP 402 &quot;Payment Required&quot; status code. When an
							AI agent requests a paid resource, the server responds with payment details. The agent sends
							Nano, retries the request with proof of payment, and receives the resource — all without
							human intervention.
						</div>
					</details>

					<details className="group rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
						<summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 [&::-webkit-details-marker]:hidden">
							Is Nano decentralized?
							<ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
						</summary>
						<div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
							Yes. Nano uses Open Representative Voting (ORV) where account holders delegate voting weight
							to representatives of their choice. Anyone can run a representative node, and no single
							entity controls the network. Voting weight is distributed across hundreds of independent
							representatives.
						</div>
					</details>

					<details className="group rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
						<summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 [&::-webkit-details-marker]:hidden">
							How do I start building with Nano?
							<ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
						</summary>
						<div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
							Visit{' '}
							<a
								href="https://docs.nano.org"
								target="_blank"
								rel="noopener noreferrer"
								className="text-cyan-600 dark:text-cyan-400 underline underline-offset-2 hover:text-cyan-500"
							>
								docs.nano.org
							</a>{' '}
							for the protocol specification and RPC reference. You can run your own Nano node, use public
							RPC endpoints, or integrate via Nano MCP servers for AI agent workflows. Client libraries
							are available for Python, JavaScript, Rust, and more.
						</div>
					</details>
				</div>
			</section>

			{/* CTA */}
			<section className="relative z-10 text-center mb-8">
				<h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to integrate Nano?</h2>
				<p className="text-muted-foreground mb-6 max-w-md mx-auto">
					Get a wallet, swap your first XNO, and start building the machine-payment infrastructure of the
					future.
				</p>
				<div className="flex items-center justify-center gap-4">
					<Button asChild>
						<Link href="/get-nano">Get Nano</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link href="/swap-nano">Swap to XNO</Link>
					</Button>
				</div>
			</section>
		</main>
	)
}

function BentoCard({
	icon: Icon,
	title,
	description,
	accentColor,
}: {
	icon: ComponentType<{ className?: string }>
	title: string
	description: string
	accentColor: 'purple' | 'blue' | 'orange'
}) {
	const colors = {
		purple: {
			bg: 'bg-purple-100 dark:bg-purple-950/50',
			border: 'border-purple-200 dark:border-purple-500/20',
			text: 'text-purple-600 dark:text-purple-400',
			hover: 'hover:border-purple-500/40 dark:hover:border-purple-500/30',
			glow: 'from-purple-500/5 dark:from-purple-500/10',
		},
		blue: {
			bg: 'bg-blue-100 dark:bg-blue-950/50',
			border: 'border-blue-200 dark:border-blue-500/20',
			text: 'text-blue-600 dark:text-blue-400',
			hover: 'hover:border-blue-500/40 dark:hover:border-blue-500/30',
			glow: 'from-blue-500/5 dark:from-blue-500/10',
		},
		orange: {
			bg: 'bg-orange-100 dark:bg-orange-950/50',
			border: 'border-orange-200 dark:border-orange-500/20',
			text: 'text-orange-600 dark:text-orange-400',
			hover: 'hover:border-orange-500/40 dark:hover:border-orange-500/30',
			glow: 'from-orange-500/5 dark:from-orange-500/10',
		},
	}

	const c = colors[accentColor]

	return (
		<div
			className={`relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 ${c.hover} transition-all duration-300 order-2 sm:order-3`}
		>
			<div
				className={`absolute inset-0 bg-linear-to-br ${c.glow} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
			/>
			<div className="relative z-10">
				<div className="flex items-center mb-2">
					<div
						className={`w-10 h-10 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center ${c.text} mr-2`}
					>
						<Icon className="w-5 h-5" />
					</div>
					<h3 className="text-lg font-bold">{title}</h3>
				</div>
				<p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
			</div>
		</div>
	)
}
