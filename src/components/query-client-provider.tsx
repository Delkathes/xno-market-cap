'use client'

import { type ReactNode, useState } from 'react'
import { QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query'

import getQueryClient from '@/lib/get-query-client'

export function QueryClientProvider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => getQueryClient())

	return <TanstackQueryClientProvider client={queryClient}>{children}</TanstackQueryClientProvider>
}
