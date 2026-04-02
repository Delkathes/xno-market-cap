'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { Send, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function PartnerForm({ className }: { className?: string }) {
	const t = useTranslations('partners.form')
	const tf = useTranslations('partners.form.fields')

	const partnerSchema = v.object({
		name: v.pipe(v.string(), v.minLength(2, tf('name.error'))),
		email: v.pipe(v.string(), v.email(tf('email.error'))),
		project: v.pipe(v.string(), v.minLength(2, tf('project.error'))),
		website: v.pipe(v.string(), v.url(tf('website.error')), v.minLength(1, tf('website.error'))),
		description: v.pipe(v.string(), v.minLength(10, tf('description.error'))),
	})

	type PartnerFormData = v.InferInput<typeof partnerSchema>

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
		window.location.href = `mailto:partners@nanomarketcap.com?subject=${encodeURIComponent(
			subject,
		)}&body=${encodeURIComponent(body)}`
	}

	return (
		<Card className={cn('overflow-hidden relative border-2 border-primary/20', className)}>
			<div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
				<Sparkles className="w-24 h-24 text-primary" />
			</div>
			<CardHeader>
				<CardTitle>{t('title')}</CardTitle>
				<CardDescription>{t('description')}</CardDescription>
			</CardHeader>
			<CardContent className="pb-4">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">{tf('name.label')}</Label>
							<Input
								id="name"
								placeholder={tf('name.placeholder')}
								{...register('name')}
								className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
							/>
							{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">{tf('email.label')}</Label>
							<Input
								id="email"
								type="email"
								placeholder={tf('email.placeholder')}
								{...register('email')}
								className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
							/>
							{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="project">{tf('project.label')}</Label>
						<Input
							id="project"
							placeholder={tf('project.placeholder')}
							{...register('project')}
							className={errors.project ? 'border-destructive focus-visible:ring-destructive' : ''}
						/>
						{errors.project && <p className="text-xs text-destructive">{errors.project.message}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="website">{tf('website.label')}</Label>
						<Input
							id="website"
							placeholder={tf('website.placeholder')}
							{...register('website')}
							className={errors.website ? 'border-destructive focus-visible:ring-destructive' : ''}
						/>
						{errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">{tf('description.label')}</Label>
						<Textarea
							id="description"
							placeholder={tf('description.placeholder')}
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
							t('submit.loading')
						) : (
							<>
								<Send className="mr-2 h-4 w-4" /> {t('submit.button')}
							</>
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
