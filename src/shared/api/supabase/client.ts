import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@app/shared/env'
import { authStorage, SESSION_KEY_PREFIX } from '@app/shared/storage'
import { logSupabaseHttpRequest } from '@app/shared/utils/apiLog'
import { logDevInspectorEvent } from '@app/shared/utils/devInspector'
import type { Database } from './database.types'
import { createFetchWithTimeout, describeRequest } from './fetchWithTimeout'
import { reportRequestTimeout } from './requestTimeoutTelemetry'

const SUPABASE_STORAGE_PREFIX = SESSION_KEY_PREFIX

/** True when MMKV is backed by native or browser storage (not Expo's Node web export for server manifest). */
function canPersistSupabaseSessionWithMMKV(): boolean {
	if (Platform.OS === 'ios' || Platform.OS === 'android') {
		return true
	}
	if (Platform.OS === 'web') {
		return (
			typeof window !== 'undefined' && typeof document !== 'undefined' && typeof document.createElement === 'function'
		)
	}
	return false
}

const supabaseServerExportMemory = new Map<string, string>()

function createSupabaseAuthStorage() {
	if (!canPersistSupabaseSessionWithMMKV()) {
		return {
			getItem: (key: string) => {
				const storageKey = `${SUPABASE_STORAGE_PREFIX}${key}`
				const value = supabaseServerExportMemory.get(storageKey) ?? null
				logDevInspectorEvent('local-cache', 'supabaseStorage.getItem', { key: storageKey, hit: !!value })
				return Promise.resolve(value)
			},
			setItem: (key: string, value: string) => {
				const storageKey = `${SUPABASE_STORAGE_PREFIX}${key}`
				supabaseServerExportMemory.set(storageKey, value)
				logDevInspectorEvent('local-cache', 'supabaseStorage.setItem', { key: storageKey })
				return Promise.resolve()
			},
			removeItem: (key: string) => {
				const storageKey = `${SUPABASE_STORAGE_PREFIX}${key}`
				supabaseServerExportMemory.delete(storageKey)
				logDevInspectorEvent('local-cache', 'supabaseStorage.removeItem', { key: storageKey })
				return Promise.resolve()
			},
		}
	}

	return {
		getItem: (key: string) => {
			const storageKey = `${SUPABASE_STORAGE_PREFIX}${key}`
			const value = authStorage.getString(storageKey) ?? null
			logDevInspectorEvent('local-cache', 'supabaseStorage.getItem', { key: storageKey, hit: !!value })
			return Promise.resolve(value)
		},
		setItem: (key: string, value: string) => {
			const storageKey = `${SUPABASE_STORAGE_PREFIX}${key}`
			authStorage.set(storageKey, value)
			logDevInspectorEvent('local-cache', 'supabaseStorage.setItem', { key: storageKey })
			return Promise.resolve()
		},
		removeItem: (key: string) => {
			const storageKey = `${SUPABASE_STORAGE_PREFIX}${key}`
			authStorage.remove(storageKey)
			logDevInspectorEvent('local-cache', 'supabaseStorage.removeItem', { key: storageKey })
			return Promise.resolve()
		},
	}
}

const supabaseStorage = createSupabaseAuthStorage()

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
	throw new Error('Missing Supabase environment variables')
}

const supabaseOrigin = new URL(SUPABASE_URL).origin
const nativeFetch: typeof fetch = globalThis.fetch.bind(globalThis)
// Every Supabase sub-client (PostgREST, Auth, Storage, Functions) goes through this one fetch,
// so the request timeout lives here. See fetchWithTimeout.ts.
const fetchWithTimeout = createFetchWithTimeout(nativeFetch, { onTimeout: reportRequestTimeout })

function instrumentSupabaseFetch(input: RequestInfo | URL, init?: RequestInit): ReturnType<typeof fetch> {
	const { method, url } = describeRequest(input, init)
	try {
		if (new URL(url).origin === supabaseOrigin) {
			logSupabaseHttpRequest(method, url)
		}
	} catch {
		// non-URL input; skip logging
	}
	return fetchWithTimeout(input, init)
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
	global: {
		fetch: instrumentSupabaseFetch,
	},
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
		storage: supabaseStorage,
	},
})
