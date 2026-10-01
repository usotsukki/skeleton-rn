import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react-native'
import React from 'react'
import { createTestQueryClient } from './queryClient'

type RenderWithAppProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
	queryClient?: QueryClient
	/** Extra providers inside the app providers (e.g. a screen-specific context). */
	wrapper?: React.ComponentType<React.PropsWithChildren>
}

/** `render` with the providers screens expect. Add providers here as screens start needing them. */
export async function renderWithAppProviders(
	ui: React.ReactElement,
	{ queryClient = createTestQueryClient(), wrapper: Extra, ...options }: RenderWithAppProvidersOptions = {},
) {
	function Providers({ children }: React.PropsWithChildren) {
		const tree = Extra ? <Extra>{children}</Extra> : children
		return <QueryClientProvider client={queryClient}>{tree}</QueryClientProvider>
	}
	const result = await render(ui, { ...options, wrapper: Providers })
	return { ...result, queryClient }
}
