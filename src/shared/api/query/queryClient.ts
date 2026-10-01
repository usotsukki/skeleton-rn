import { QueryClient } from '@tanstack/react-query'
import { createQueryRetryPolicy } from './retryPolicy'

/**
 * How long a persisted snapshot stays usable. `gcTime` must be at least this, or TanStack garbage
 * collects restored queries that no screen observes before they can be used.
 */
export const PERSIST_MAX_AGE_MS = 1000 * 60 * 60 * 24

const DEFAULT_RETRY_COUNT = 2

export type AppQueryMeta = Record<string, unknown> & {
	/** `false` keeps this query out of the on-disk cache (see queryPersister.ts). */
	persist?: boolean
}

declare module '@tanstack/react-query' {
	interface Register {
		queryMeta: AppQueryMeta
	}
}

export function createAppQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: createQueryRetryPolicy(DEFAULT_RETRY_COUNT),
				gcTime: PERSIST_MAX_AGE_MS,
			},
		},
	})
}
