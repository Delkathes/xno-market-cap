export function ModernPageBackground() {
	return (
		<div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,hsl(var(--primary)/0.18),transparent_36%),radial-gradient(circle_at_88%_14%,hsl(220_100%_64%/0.16),transparent_34%),radial-gradient(circle_at_52%_88%,hsl(190_90%_60%/0.13),transparent_38%),radial-gradient(circle_at_34%_72%,hsl(255_90%_70%/0.09),transparent_42%)] dark:bg-[radial-gradient(circle_at_12%_16%,hsl(var(--primary)/0.22),transparent_38%),radial-gradient(circle_at_88%_14%,hsl(220_100%_74%/0.18),transparent_36%),radial-gradient(circle_at_52%_88%,hsl(190_90%_68%/0.16),transparent_40%),radial-gradient(circle_at_34%_72%,hsl(255_92%_78%/0.11),transparent_44%)]" />

			<div className="absolute -top-36 left-4 h-112 w-md rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-300/24" />
			<div className="absolute -top-20 -right-24 h-96 w-96 rounded-full bg-blue-500/18 blur-3xl dark:bg-blue-300/22" />
			<div className="absolute -bottom-28 left-1/3 h-88 w-88 rounded-full bg-violet-500/14 blur-3xl dark:bg-violet-300/20" />
			<div className="absolute bottom-16 right-1/4 h-72 w-72 rounded-full bg-sky-400/12 blur-3xl dark:bg-sky-300/18" />

			<div className="absolute inset-0 opacity-50 dark:opacity-60 bg-[radial-gradient(hsl(var(--border)/0.4)_0.8px,transparent_0.8px)] bg-size-[20px_20px]" />

			<div className="absolute inset-x-0 top-0 h-56 bg-linear-to-b from-background/30 to-transparent" />
			<div className="absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-background/26 to-transparent" />
			<div className="absolute inset-0 mask-[radial-gradient(ellipse_at_center,transparent_56%,black)] bg-background/40 dark:bg-background/50" />
		</div>
	)
}
