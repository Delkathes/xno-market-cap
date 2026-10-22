import type { PartnerContent } from './partner-config'

type PartnerCopy = {
	partnerName: string
	title: string
	description: string
}

const partnerCopy: Record<string, Record<string, PartnerCopy>> = {
	'x402nano-org': {
		en: {
			partnerName: 'x402nano.org',
			title: 'x402nano.org: feeless x402 facilitator for Nano payments',
			description:
				'Use a permissionless Nano facilitator for x402 apps and APIs. No signup required: verify and settle HTTP 402 payments in minutes.',
		},
		fr: {
			partnerName: 'x402nano.org',
			title: 'x402nano.org : facilitateur x402 sans frais pour les paiements Nano',
			description:
				'Utilisez un facilitateur Nano sans permission pour vos applications et API x402. Sans inscription : vérifiez et réglez les paiements HTTP 402 en quelques minutes.',
		},
		de: {
			partnerName: 'x402nano.org',
			title: 'x402nano.org: gebührenfreier x402-Facilitator für Nano-Zahlungen',
			description:
				'Nutze einen Nano-Facilitator ohne Zugangsbeschränkung für x402-Apps und APIs. Keine Anmeldung nötig: HTTP-402-Zahlungen in Minuten prüfen und abwickeln.',
		},
		es: {
			partnerName: 'x402nano.org',
			title: 'x402nano.org: facilitador x402 sin comisiones para pagos con Nano',
			description:
				'Usa un facilitador Nano sin permisos para apps y API x402. Sin registro: verifica y liquida pagos HTTP 402 en minutos.',
		},
		it: {
			partnerName: 'x402nano.org',
			title: 'x402nano.org: facilitatore x402 senza commissioni per pagamenti Nano',
			description:
				'Usa un facilitatore Nano senza permessi per app e API x402. Nessuna registrazione: verifica e regola i pagamenti HTTP 402 in pochi minuti.',
		},
		nl: {
			partnerName: 'x402nano.org',
			title: 'x402nano.org: kosteloze x402-facilitator voor Nano-betalingen',
			description:
				"Gebruik een open Nano-facilitator voor x402-apps en API's. Geen account nodig: verifieer en verreken HTTP 402-betalingen binnen enkele minuten.",
		},
	},
}

export function getPartnerCopy(partner: PartnerContent, locale: string): PartnerCopy {
	return (
		partnerCopy[partner.id]?.[locale] ??
		partnerCopy[partner.id]?.en ?? {
			partnerName: partner.partnerName,
			title: partner.title,
			description: partner.description,
		}
	)
}
