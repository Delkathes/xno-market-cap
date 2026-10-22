import type { ReactNode } from 'react'
import { Provider as JotaiProvider } from 'jotai'
import type { AbstractIntlMessages } from 'next-intl'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

import { QueryClientProvider } from './query-client-provider'

// Namespaces that no client-reachable module reads. Verified by walking the
// import graph from every 'use client' module rather than by filename, since a
// file without the directive still runs on the client once a client component
// imports it. Dropping these removes roughly 59% of the message payload that is
// otherwise serialized into every page response.
//
// If a client component ever starts calling useTranslations for one of these,
// add the exception here or NextIntlClientProvider throws MISSING_MESSAGE.
const SERVER_ONLY_NAMESPACES = ['metadata', 'getNano', 'notFound', 'common', 'footer', 'trustPages'] as const

// Namespaces that are mostly server-only but have one client consumer each.
const PARTIAL_CLIENT_NEEDS: Record<string, readonly string[]> = {
	legal: ['inlineDisclaimers'],
	whyNano: ['x402'],
}

function selectClientMessages(messages: AbstractIntlMessages): AbstractIntlMessages {
	const selected: AbstractIntlMessages = { ...messages }

	for (const namespace of SERVER_ONLY_NAMESPACES) {
		delete selected[namespace]
	}

	for (const [namespace, keep] of Object.entries(PARTIAL_CLIENT_NEEDS)) {
		const source = messages[namespace]
		if (!source || typeof source !== 'object') continue

		const trimmed: AbstractIntlMessages = {}
		for (const leaf of keep) {
			if (leaf in source) trimmed[leaf] = source[leaf]
		}
		selected[namespace] = trimmed
	}

	return selected
}

export async function Providers({ children }: { children: ReactNode }) {
	return (
		<NextIntlClientWithMessagesProvider>
			<QueryClientProvider>
				<JotaiProvider>{children}</JotaiProvider>
			</QueryClientProvider>
		</NextIntlClientWithMessagesProvider>
	)
}

async function NextIntlClientWithMessagesProvider({ children }: { children: ReactNode }) {
	const messages = await getMessages()
	return <NextIntlClientProvider messages={selectClientMessages(messages)}>{children}</NextIntlClientProvider>
}
