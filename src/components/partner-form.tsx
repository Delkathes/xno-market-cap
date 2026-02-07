'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { Send, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const partnerSchema = v.object({
	name: v.pipe(v.string(), v.minLength(2, 'Name is required')),
	email: v.pipe(v.string(), v.email('Invalid email address')),
	project: v.pipe(v.string(), v.minLength(2, 'Project name is required')),
	website: v.pipe(v.string(), v.url('Invalid URL'), v.minLength(1, 'Website is required')),
	description: v.pipe(v.string(), v.minLength(10, 'Please provide a brief description')),
})

type PartnerFormData = v.InferInput<typeof partnerSchema>

export function PartnerForm({ className }: { className?: string }) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<PartnerFormData>({
		resolver: valibotResolver(partnerSchema),
	})

	const onSubmit = (data: PartnerFormData) => {
		const subject = `Partner Request: ${data.project}`
		const body = `Name: ${data.name}
Email: ${data.email}
Project: ${data.project}
Website: ${data.website}

Description:
${data.description}
`
		window.location.href = `mailto:partners@xnomarketcap.com?subject=${encodeURIComponent(
			subject,
		)}&body=${encodeURIComponent(body)}`
	}

	return (
		<Card className={cn('overflow-hidden relative border-2 border-primary/20', className)}>
			<div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
				<Sparkles className="w-24 h-24 text-primary" />
			</div>
			<CardHeader>
				<CardTitle>Start Your Partnership</CardTitle>
				<CardDescription>
					Fill out the details below to generate a request. We'll get back to you within 24 hours.
				</CardDescription>
			</CardHeader>
			<CardContent className="pb-4">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">Contact Name</Label>
							<Input
								id="name"
								placeholder="John Doe"
								{...register('name')}
								className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
							/>
							{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="john@example.com"
								{...register('email')}
								className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
							/>
							{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="project">Project Name</Label>
						<Input
							id="project"
							placeholder="My Awesome Nano App"
							{...register('project')}
							className={errors.project ? 'border-destructive focus-visible:ring-destructive' : ''}
						/>
						{errors.project && <p className="text-xs text-destructive">{errors.project.message}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="website">Website URL</Label>
						<Input
							id="website"
							placeholder="https://"
							{...register('website')}
							className={errors.website ? 'border-destructive focus-visible:ring-destructive' : ''}
						/>
						{errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Campaign Details</Label>
						<Textarea
							id="description"
							placeholder="Tell us about what you want to promote..."
							className={cn(
								'resize-none',
								errors.description ? 'border-destructive focus-visible:ring-destructive' : '',
							)}
							{...register('description')}
						/>
						{errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
					</div>

					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? (
							'Preparing...'
						) : (
							<>
								<Send className="mr-2 h-4 w-4" /> Send Request
							</>
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
