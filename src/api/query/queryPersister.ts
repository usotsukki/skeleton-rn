import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { defaultShouldDehydrateQuery, type QueryClient } from '@tanstack/react-query'
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client'
import * as Application from 'expo-application'
import * as Updates from 'expo-updates'
import { queryCacheStorage } from '@app/storage'
import { PERSIST_MAX_AGE_MS } from './queryClient'

/**
 * On-disk TanStack Query cache (MMKV, plain JSON: `Map`/`Set`/`Date` values do not round-trip, so
 * keep query data JSON-shaped or opt the query out with `meta: { persist: false }`).
 *
 * Default-persist with per-query opt-out: TanStack does not persist `meta`, so a restored query has
 * no meta, passes the predicate, and rejoins the snapshot on the next save; an opt-out query is
 * dropped again as soon as its own `meta` is back.
 */
export const persister = createSyncStoragePersister({
	storage: {
		getItem: key => queryCacheStorage.getString(key) ?? null,
		setItem: (key, value) => queryCacheStorage.set(key, value),
		removeItem: key => queryCacheStorage.remove(key),
	},
	key: 'query-cache',
})

/**
 * A snapshot is discarded when any part of this changes:
 * - native build or OTA update id: a new bundle can change query shapes without a native bump;
 * - the user signed in when the app started: a snapshot saved after an in-session account switch
 *   belongs to someone else on the next launch.
 */
export function queryCacheBuster(uid: string | null): string {
	return `${Application.nativeBuildVersion ?? 'dev'}-${Updates.updateId ?? 'embedded'}-${uid ?? 'anon'}`
}

export function createQueryPersistOptions(uid: string | null): Omit<PersistQueryClientOptions, 'queryClient'> {
	return {
		persister,
		maxAge: PERSIST_MAX_AGE_MS,
		buster: queryCacheBuster(uid),
		dehydrateOptions: {
			shouldDehydrateQuery: query => defaultShouldDehydrateQuery(query) && query.meta?.persist !== false,
		},
	}
}

/**
 * Wipes the on-disk snapshot. Call after `queryClient.clear()` on sign-out: the persister's
 * throttled save that follows writes the already-cleared cache.
 */
export function clearPersistedQueryCache(): void {
	persister.removeClient()
}

/**
 * Keeps the query cache (memory and disk) to one user.
 *
 * - `onRestored`: a SIGNED_OUT (e.g. a revoked session at cold start) can land while the snapshot is
 *   being restored, and restore hydrates after the auth listener's `clear()`. Once restore finishes,
 *   drop the cache if the signed-in user is no longer the one it was restored for (the launch user).
 * - `onSignedIn`: signing in as someone else without a sign-out in between (only SIGNED_IN fires)
 *   must not show the previous user's cache.
 * - `onSignedOut`: clear, then wipe the snapshot; the persister's throttled save that follows writes
 *   the already-cleared cache.
 */
export function createQueryCacheOwnership(queryClient: QueryClient, launchUid: string | null) {
	let owner = launchUid
	const reset = () => {
		queryClient.clear()
		clearPersistedQueryCache()
	}
	return {
		onRestored(currentUid: string | null) {
			if (currentUid !== launchUid) reset()
		},
		onSignedIn(uid: string) {
			if (uid !== owner) reset()
			owner = uid
		},
		onSignedOut() {
			reset()
			owner = null
		},
	}
}
