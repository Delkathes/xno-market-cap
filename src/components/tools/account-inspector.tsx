'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ScanSearch } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { isValidNanoAddress } from '@/lib/nano-utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AccountInspectorEntry({ locale }: { locale: string }) {
	const t = useTranslations('tools.accountInspector')
	const router = useRouter()
	const [address, setAddress] = useState('')

	const addressValid = isValidNanoAddress(address.trim())

	const open = () => {
		if (!addressValid) return
		const prefix = locale === 'en' ? '' : `/${locale}`
		router.push(`${prefix}/account/${address.trim()}` as Route)
	}

	return (
		<div className="space-y-5">
			<div className="space-y-2">
				<Label
					htmlFor="ai-address"
					className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
				>
					{t('address')}
				</Label>
				<div className="flex gap-2">
					<Input
						id="ai-address"
						value={address}
						onChange={(event) => setAddress(event.target.value)}
						placeholder={t('addressPlaceholder')}
						className="font-mono"
						aria-invalid={address.trim() !== '' && !addressValid}
						onKeyDown={(event) => {
							if (event.key === 'Enter') open()
						}}
					/>
					<Button type="button" onClick={open} disabled={!addressValid} className="flex-none cursor-pointer">
						<ScanSearch className="h-4 w-4" />
						{t('inspect')}
					</Button>
				</div>
				{address.trim() !== '' && !addressValid && (
					<p className="text-xs text-destructive">{t('invalidAddress')}</p>
				)}
			</div>

			<p className="text-xs text-muted-foreground/70">{t('note')}</p>
		</div>
	)
}
