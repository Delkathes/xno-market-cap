import type { ReactNode } from 'react'
import { Provider as JotaiProvider } from 'jotai'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

import { QueryClientProvider } from './query-client-provider'

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
	return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
}
