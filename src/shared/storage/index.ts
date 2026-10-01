import { useMMKVDevTools } from '@dev-plugins/react-native-mmkv'
import { createMMKV } from 'react-native-mmkv'
import { Device, MMKVStorage } from './schema'

/**
 * Storage used by zustand's persist middleware.
 * DO NOT use this directly.
 */
export const zustandStorage = createMMKV({ id: 'zustand' })

/**
 * Hook to use MMKV DevTools for debugging.
 * Change 'storage' value to select storage for debugging.
 * Example with MMKVStorage class: useMMKVDevTools({ storage: customStorage.getStore() })
 */
export const useStorageDevTools = (): void => useMMKVDevTools({ storage: zustandStorage })

export const deviceStorage = new MMKVStorage<[], Device>({ id: 'device' })

export { authStorage, type KeyValueStore, SESSION_KEY_PREFIX } from './authStorage'

/** TanStack Query cache snapshot. Owned by `src/shared/api/query/queryPersister.ts`; don't write to it directly. */
export const queryCacheStorage = createMMKV({ id: 'tanstack-query' })

/** PostHog's persisted state (ids, queue, opt-out). Owned by `src/shared/api/analytics/client.ts`. */
export const analyticsStorage = createMMKV({ id: 'analytics' })
