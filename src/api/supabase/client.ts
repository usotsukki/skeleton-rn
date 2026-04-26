import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@app/env'
import { authStorage } from '@app/storage'
import { logSupabaseHttpRequest } from '@app/utils/apiLog'
import { logDevInspectorEvent } from '@app/utils/devInspector'

const SUPABASE_STORAGE_PREFIX = 'supabase:'

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

function instrumentSupabaseFetch(input: RequestInfo | URL, init?: RequestInit): ReturnType<typeof fetch> {
	let urlStr: string
	let method: string
	if (typeof input === 'string') {
		urlStr = input
		method = (init?.method ?? 'GET').toUpperCase()
	} else if (input instanceof URL) {
		urlStr = input.href
		method = (init?.method ?? 'GET').toUpperCase()
	} else {
		urlStr = input.url
		method = (init?.method ?? input.method ?? 'GET').toUpperCase()
	}
	try {
		if (new URL(urlStr).origin === supabaseOrigin) {
			logSupabaseHttpRequest(method, urlStr)
		}
	} catch {
		// non-URL input; skip logging
	}
	return nativeFetch(input as RequestInfo, init)
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
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
