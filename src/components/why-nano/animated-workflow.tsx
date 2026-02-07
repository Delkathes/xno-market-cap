'use client'

import type { ComponentType } from 'react'
import { useEffect, useState } from 'react'
import { Coins, CreditCard, Database, Mail, MessageSquare, Send, Zap } from 'lucide-react'

type WorkflowNodeConfig = {
	icon: ComponentType<{ className?: string }>
	label: string
	sublabel: string
	color: 'yellow' | 'cyan' | 'green' | 'purple'
}

type LogEntry = {
	node: string
	result: string
	duration: string
}

type WorkflowConfig = {
	title: string
	runNumber: string
	totalTime: string
	nodes: WorkflowNodeConfig[]
	log: LogEntry[]
}

const workflows: WorkflowConfig[] = [
	{
		title: 'Nano Payment Workflow',
		runNumber: '#1,847',
		totalTime: '0.9s',
		nodes: [
			{ icon: Zap, label: 'Webhook Trigger', sublabel: 'On task completion', color: 'yellow' },
			{ icon: Database, label: 'Check Balance', sublabel: 'Nano RPC', color: 'cyan' },
			{ icon: CreditCard, label: 'Send Nano', sublabel: '0.001 XNO', color: 'green' },
			{ icon: Mail, label: 'Notify Agent', sublabel: 'Confirmation', color: 'purple' },
		],
		log: [
			{ node: 'Webhook Trigger', result: 'Task #4821 completed', duration: '12ms' },
			{ node: 'Check Balance', result: '142.38 XNO available', duration: '85ms' },
			{ node: 'Send Nano', result: '0.001 XNO sent · 0 fee · confirmed', duration: '380ms' },
			{ node: 'Notify Agent', result: 'Payment proof delivered', duration: '420ms' },
		],
	},
	{
		title: 'Payment Received Handler',
		runNumber: '#3,204',
		totalTime: '1.1s',
		nodes: [
			{ icon: Coins, label: 'Webhook Trigger', sublabel: 'On payment received', color: 'yellow' },
			{ icon: Database, label: 'Verify Block', sublabel: 'Nano RPC', color: 'cyan' },
			{ icon: Send, label: 'Grant Access', sublabel: 'API Token', color: 'green' },
			{ icon: MessageSquare, label: 'Send Receipt', sublabel: 'Notification', color: 'purple' },
		],
		log: [
			{ node: 'Webhook Trigger', result: 'Received 0.05 XNO from nano_1abc...', duration: '8ms' },
			{ node: 'Verify Block', result: 'Block confirmed · amount matches', duration: '120ms' },
			{ node: 'Grant Access', result: 'API key issued · 24h expiry', duration: '540ms' },
			{ node: 'Send Receipt', result: 'Confirmation sent to agent', duration: '430ms' },
		],
	},
]

const DISPLAY_DURATION = 8000
const FADE_DURATION = 400

const nodeColors = {
	yellow: {
		bg: 'bg-yellow-100 dark:bg-yellow-950/50',
		border: 'border-yellow-300 dark:border-yellow-500/30',
		icon: 'text-yellow-600 dark:text-yellow-400',
		ring: 'ring-yellow-500/30',
	},
	cyan: {
		bg: 'bg-cyan-100 dark:bg-cyan-950/50',
		border: 'border-cyan-300 dark:border-cyan-500/30',
		icon: 'text-cyan-600 dark:text-cyan-400',
		ring: 'ring-cyan-500/30',
	},
	green: {
		bg: 'bg-green-100 dark:bg-green-950/50',
		border: 'border-green-300 dark:border-green-500/30',
		icon: 'text-green-600 dark:text-green-400',
		ring: 'ring-green-500/30',
	},
	purple: {
		bg: 'bg-purple-100 dark:bg-purple-950/50',
		border: 'border-purple-300 dark:border-purple-500/30',
		icon: 'text-purple-600 dark:text-purple-400',
		ring: 'ring-purple-500/30',
	},
}

export function AnimatedWorkflow() {
	const [workflowIndex, setWorkflowIndex] = useState(0)
	const [activeNodeIndex, setActiveNodeIndex] = useState(-1)
	const [visibleLogLines, setVisibleLogLines] = useState(0)
	const [isFading, setIsFading] = useState(false)

	const workflow = workflows[workflowIndex]

	// Animate nodes lighting up one by one, then log lines
	useEffect(() => {
		setActiveNodeIndex(-1)
		setVisibleLogLines(0)
		setIsFading(false)

		const timers: ReturnType<typeof setTimeout>[] = []
		const currentWorkflow = workflows[workflowIndex]

		// Animate each node
		for (let i = 0; i < currentWorkflow.nodes.length; i++) {
			timers.push(
				setTimeout(
					() => {
						setActiveNodeIndex(i)
					},
					400 + i * 500,
				),
			)
		}

		// Animate log lines (start after last node)
		const logStart = 400 + currentWorkflow.nodes.length * 500 + 300
		for (let i = 0; i < currentWorkflow.log.length; i++) {
			timers.push(
				setTimeout(
					() => {
						setVisibleLogLines(i + 1)
					},
					logStart + i * 300,
				),
			)
		}

		// Fade and switch
		const totalAnimTime = logStart + currentWorkflow.log.length * 300
		timers.push(
			setTimeout(() => {
				setIsFading(true)
			}, totalAnimTime + DISPLAY_DURATION),
		)
		timers.push(
			setTimeout(
				() => {
					setWorkflowIndex((prev) => (prev + 1) % workflows.length)
				},
				totalAnimTime + DISPLAY_DURATION + FADE_DURATION,
			),
		)

		return () => {
			for (const t of timers) clearTimeout(t)
		}
	}, [workflowIndex])

	return (
		<div className="rounded-xl border border-border bg-card/60 backdrop-blur-xl overflow-hidden shadow-xl">
			{/* Toolbar */}
			<div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 rounded bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
						<span className="text-orange-500 text-[10px] font-bold">n8n</span>
					</div>
					<span className="text-xs font-medium text-muted-foreground">{workflow.title}</span>
				</div>
				<div className="flex items-center gap-3">
					{/* Scenario indicator */}
					<div className="flex items-center gap-1.5">
						{workflows.map((_, i) => (
							<div
								key={`wf-dot-${workflows[i].title}`}
								className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
									i === workflowIndex ? 'bg-green-500' : 'bg-border'
								}`}
							/>
						))}
					</div>
					<div className="flex items-center gap-1.5">
						<div className="w-2 h-2 rounded-full bg-green-500/70" />
						<span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Active</span>
					</div>
				</div>
			</div>

			{/* Canvas */}
			<div
				className={`relative p-6 md:p-10 bg-[radial-gradient(circle,hsl(var(--border))_1px,transparent_1px)] bg-size-[24px_24px] transition-opacity duration-300 ${
					isFading ? 'opacity-0' : 'opacity-100'
				}`}
			>
				{/* Workflow nodes */}
				<div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0">
					{workflow.nodes.map((node, i) => {
						const c = nodeColors[node.color]
						const Icon = node.icon
						const isActive = i <= activeNodeIndex
						const isCurrentlyAnimating = i === activeNodeIndex

						return (
							<div key={`node-${workflow.title}-${node.label}`} className="contents">
								{i > 0 && <WorkflowConnector active={i <= activeNodeIndex} />}
								<div
									className={`relative flex flex-col items-center gap-2 rounded-xl border ${c.border} bg-card/80 backdrop-blur p-4 w-36 shrink-0 transition-all duration-500 ${
										isActive ? `ring-2 ${c.ring} scale-105` : 'opacity-50 scale-100'
									} ${isCurrentlyAnimating ? 'animate-[pulse_1s_ease-in-out_1]' : ''}`}
								>
									<div
										className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center ${c.icon} transition-transform duration-300 ${
											isActive ? 'scale-110' : ''
										}`}
									>
										<Icon className="w-4 h-4" />
									</div>
									<div className="text-center">
										<div className="text-xs font-semibold leading-tight">{node.label}</div>
										<div className="text-[10px] text-muted-foreground mt-0.5">{node.sublabel}</div>
									</div>
								</div>
							</div>
						)
					})}
				</div>

				{/* Execution log */}
				<div className="mt-8 rounded-lg border border-border bg-card/80 backdrop-blur p-4">
					<div className="flex items-center justify-between mb-3">
						<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Execution Log
						</span>
						<span className="text-[10px] font-mono text-muted-foreground">
							Run {workflow.runNumber} · {workflow.totalTime} total
						</span>
					</div>
					<div className="space-y-2 font-mono text-xs min-h-24">
						{workflow.log.slice(0, visibleLogLines).map((entry, i) => (
							<div
								key={`log-${workflow.title}-${entry.node}`}
								className={`flex items-center gap-2 ${i === visibleLogLines - 1 ? 'animate-[fade-in_0.3s_ease-out]' : ''}`}
							>
								<div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
								<span className="text-muted-foreground shrink-0">{entry.node}</span>
								<span className="text-muted-foreground/50">—</span>
								<span className="text-foreground truncate">{entry.result}</span>
								<span className="ml-auto text-muted-foreground shrink-0">{entry.duration}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

function WorkflowConnector({ active }: { active: boolean }) {
	return (
		<div className="flex items-center justify-center shrink-0">
			<div className="hidden md:block w-8 h-px relative">
				<div
					className={`absolute inset-0 transition-colors duration-500 ${active ? 'bg-green-500/50' : 'bg-border'}`}
				/>
				<div
					className={`absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-[6px] transition-colors duration-500 ${
						active ? 'border-l-green-500/50' : 'border-l-border'
					}`}
				/>
			</div>
			<div className="md:hidden h-6 w-px relative">
				<div
					className={`absolute inset-0 transition-colors duration-500 ${active ? 'bg-green-500/50' : 'bg-border'}`}
				/>
				<div
					className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-[6px] transition-colors duration-500 ${
						active ? 'border-t-green-500/50' : 'border-t-border'
					}`}
				/>
			</div>
		</div>
	)
}
