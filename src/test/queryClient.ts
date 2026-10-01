import { type DefaultOptions, QueryClient } from '@tanstack/react-query'

const clients = new Set<QueryClient>()

/** A QueryClient for tests: no retries, no GC timers. Destroyed automatically after each test. */
export function createTestQueryClient(defaultOptions?: DefaultOptions): QueryClient {
	const client = new QueryClient({
		defaultOptions: {
			...defaultOptions,
			queries: { retry: false, gcTime: Infinity, ...defaultOptions?.queries },
			mutations: { retry: false, gcTime: Infinity, ...defaultOptions?.mutations },
		},
	})
	clients.add(client)
	return client
}

/** Called from setup.ts afterEach. */
export function destroyTestQueryClients(): void {
	clients.forEach(client => {
		client.clear()
		client.unmount()
	})
	clients.clear()
}
