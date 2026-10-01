import * as Sentry from '@sentry/react-native'
import type { QueryClient } from '@tanstack/react-query'
import { AppState } from 'react-native'

const SWEEP_INTERVAL_MS = 5_000
const REPORT_AFTER_MS = 15_000

/**
 * Reports queries stuck in `fetching` past REPORT_AFTER_MS (once per query per app session), so an
 * "infinite spinner" report arrives with the exact query key and elapsed time instead of a screen
 * name. That also tells a hung fetch (see fetchWithTimeout.ts) apart from a response the UI never
 * consumed.
 *
 * Clocks count foreground time only: time across a background stint is OS suspension, not query
 * latency. Any transition away from `active` wipes the in-flight clocks; still-fetching queries
 * restart their clock on the first sweep after resume.
 *
 * Observer-less fetches (prefetch, invalidation churn) are never reported: no one is looking at a
 * spinner for them. The clock still runs, so a query the user starts observing mid-fetch reports
 * with its true elapsed time. Paused (offline) queries are not `fetching` and are never reported.
 */
export function startSlowQueryWatchdog(queryClient: QueryClient): () => void {
	const firstSeenFetching = new Map<string, number>()
	const reported = new Set<string>()

	const appStateSubscription = AppState.addEventListener('change', state => {
		if (state !== 'active') firstSeenFetching.clear()
	})

	const interval = setInterval(() => {
		if (AppState.currentState !== 'active') {
			firstSeenFetching.clear()
			return
		}

		const now = Date.now()
		const stillFetching = new Set<string>()

		for (const query of queryClient.getQueryCache().getAll()) {
			if (query.state.fetchStatus !== 'fetching') continue
			stillFetching.add(query.queryHash)

			const since = firstSeenFetching.get(query.queryHash)
			if (since === undefined) {
				firstSeenFetching.set(query.queryHash, now)
				continue
			}

			const elapsedMs = now - since
			if (elapsedMs < REPORT_AFTER_MS || reported.has(query.queryHash)) continue

			const observers = query.getObserversCount()
			if (observers === 0) continue

			reported.add(query.queryHash)
			console.warn('[slow-query]', query.queryHash, `${Math.round(elapsedMs / 1000)}s`)
			Sentry.captureMessage('slow-query', {
				level: 'warning',
				extra: {
					queryKey: query.queryKey,
					elapsedMs,
					observers,
				},
			})
		}

		// Settled queries leave the map so a later refetch starts a fresh clock.
		for (const hash of firstSeenFetching.keys()) {
			if (!stillFetching.has(hash)) firstSeenFetching.delete(hash)
		}
	}, SWEEP_INTERVAL_MS)

	return () => {
		appStateSubscription.remove()
		clearInterval(interval)
	}
}
