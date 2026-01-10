'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export function LoadingArea() {
	const isLoading = true // Replace with actual loading state logic

	const [isVisible, setIsVisible] = useState(true)
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		// Simulate loading progress
		const interval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					clearInterval(interval)
					return 100
				}
				return prev + Math.random() * 15
			})
		}, 150)

		return () => clearInterval(interval)
	}, [])

	useEffect(() => {
		if (!isLoading && progress >= 100) {
			// Delay before fade out
			const timeout = setTimeout(() => {
				setIsVisible(false)
			}, 300)
			return () => clearTimeout(timeout)
		}
	}, [progress])

	if (!isVisible) return null

	return (
		<div
			className={cn(
				'absolute inset-0 z-100 flex flex-col items-center justify-center bg-linear-to-br from-[#4A90E2] via-[#5BA3F5] to-[#209CE9] dark:from-[#254f80] dark:via-[#2a65a8] dark:to-[#04598d] transition-opacity duration-700',
				!isLoading && progress >= 100 ? 'opacity-0' : 'opacity-100',
			)}
		>
			{/* Animated background particles */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -left-4 top-1/4 h-72 w-72 animate-blob rounded-full bg-white/30 dark:bg-white/50 mix-blend-overlay blur-3xl" />
				<div className="animation-delay-2000 absolute right-1/4 top-1/3 h-72 w-72 animate-blob rounded-full bg-white/30 dark:bg-white/50 repeat-infinite mix-blend-overlay blur-3xl" />
				<div className="animation-delay-4000 absolute bottom-1/4 left-1/3 h-72 w-72 animate-blob rounded-full bg-white/30 dark:bg-white/50 repeat-infinite mix-blend-overlay blur-3xl" />
			</div>

			{/* Logo container */}
			<div className="relative z-10 animate-fade-in">
				<div className="relative">
					{/* Pulsing ring */}
					<div
						className="absolute inset-0 animate-ping rounded-full bg-background/20"
						style={{ animationDuration: '2s' }}
					/>

					{/* Logo */}
					<div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-background/90 shadow-2xl backdrop-blur-sm">
						<svg
							width="1080"
							height="1080"
							viewBox="0 0 1080 1080"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="h-20 w-20 animate-pulse"
							style={{ animationDuration: '2s' }}
						>
							<title>XNO</title>
							<circle cx="540" cy="540" r="540" fill="#209CE9" />
							<path
								d="M792.911 881H740.396L541.099 570.561L338.761 881H286.68L513.452 529.3L306.882 206.222H360.42L541.95 490.393L727.322 206.222H777.555L568.762 528.379L792.911 881Z"
								fill="background"
							/>
							<path
								d="M336.487 508.737H744.807V547.116H336.487V508.737ZM336.487 623.872H744.824V662.251H336.47L336.487 623.872Z"
								fill="background"
							/>
						</svg>

						{/* <img
							src="/nano/badge-blue.svg"
							alt="Nano Logo"
							className="h-20 w-20 animate-pulse"
							style={{ animationDuration: '2s' }}
						/> */}
					</div>
				</div>
			</div>

			{/* Title */}
			{/* <h1
                className="animate-fade-in-up mb-2 text-4xl font-bold text-white drop-shadow-lg"
                style={{ animationDelay: '0.2s' }}
            >
                Nano Pixels
            </h1> */}

			{/* Subtitle */}
			{/* <p className="animate-fade-in-up mb-8 text-lg text-white/90 drop-shadow" style={{ animationDelay: '0.4s' }}>
                Collaborative Canvas Powered by XNO
            </p> */}

			{/* Progress bar */}
			{/* <div className="animate-fade-in-up w-64" style={{ animationDelay: '0.6s' }}>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
                    <div
                        className="h-full rounded-full bg-white shadow-lg transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
                <p className="mt-2 text-center text-sm text-white/80">{Math.min(Math.round(progress), 100)}%</p>
            </div> */}
		</div>
	)
}
