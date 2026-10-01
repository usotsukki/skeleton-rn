import * as Sentry from '@sentry/react-native'
import { getRandomValues } from 'expo-crypto'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { createMMKV, deleteMMKV, existsMMKV, type MMKV } from 'react-native-mmkv'

/** The subset of MMKV that auth code uses, so a memory store can stand in for it. */
export interface KeyValueStore {
	getString: (key: string) => string | undefined
	set: (key: string, value: string) => void
	remove: (key: string) => void
}

/** Supabase session keys in this store (`client.ts` prefixes its storage keys with it). */
export const SESSION_KEY_PREFIX = 'supabase:'

/** Before encryption: plain MMKV. Migrated once, then deleted (clearAll would leave the bytes on disk). */
const LEGACY_ID = 'auth'
const STORE_ID = 'auth.v2'
/** Non-secret flags about the encrypted store. */
const META_ID = 'auth.meta'
const STALE_FLAG = 'staleEncryptedStore'
const KEYCHAIN_KEY = 'mmkv.auth.v2.key'
/** Written last when a store is set up; missing = new store, interrupted migration or a key that can't decrypt it. */
const SENTINEL_KEY = '__authStore'
const SENTINEL_VALUE = 'ok'

// AES-256 takes 32 bytes; ASCII letters and digits are one byte each in UTF-8.
const KEY_LENGTH = 32
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
/** Largest multiple of the alphabet size below 256: bytes above it are skipped so every character is equally likely. */
const UNBIASED_LIMIT = 256 - (256 % ALPHABET.length)

// The key stays on this device: a restored backup or a new phone can't decrypt the old store, so the
// user signs in again instead of carrying refresh tokens across devices. After first unlock so a
// background token refresh can read it.
const KEYCHAIN_OPTIONS: SecureStore.SecureStoreOptions = {
	keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
}

function generateKey(): string {
	let key = ''
	while (key.length < KEY_LENGTH) {
		for (const byte of getRandomValues(new Uint8Array(KEY_LENGTH * 2))) {
			if (byte < UNBIASED_LIMIT && key.length < KEY_LENGTH) key += ALPHABET[byte % ALPHABET.length]
		}
	}
	return key
}

function readOrCreateKey(): string {
	const existing = SecureStore.getItem(KEYCHAIN_KEY, KEYCHAIN_OPTIONS)
	if (existing) return existing
	const key = generateKey()
	SecureStore.setItem(KEYCHAIN_KEY, key, KEYCHAIN_OPTIONS)
	return key
}

function copyLegacyInto(store: MMKV) {
	if (!existsMMKV(LEGACY_ID)) return
	const legacy = createMMKV({ id: LEGACY_ID })
	for (const key of legacy.getAllKeys()) {
		const value = legacy.getString(key)
		if (value !== undefined) store.set(key, value)
	}
}

/**
 * Session storage for this run only, used when the keychain can't be read (e.g. a background launch
 * before the first unlock). The encrypted store keeps the last session. Writing a new session here
 * (a sign-in, maybe another account) makes that one outdated, so it is marked stale and cleared on the
 * next start instead of resurrecting it. Signed-out bootstrap writes (the auth store's `user: null`)
 * don't count: they would wipe a valid session after every locked launch.
 */
function createMemoryStore(onSessionWrite: () => void): KeyValueStore {
	const values = new Map<string, string>()
	return {
		getString: key => values.get(key),
		set: (key, value) => {
			values.set(key, value)
			// The PKCE verifier of an OAuth flow is written before sign-in finishes (and stays if it's abandoned).
			if (key.startsWith(SESSION_KEY_PREFIX) && !key.endsWith('-code-verifier')) onSessionWrite()
		},
		remove: key => {
			values.delete(key)
		},
	}
}

const openMMKV = (encryptionKey: string) => createMMKV({ id: STORE_ID, encryptionKey, encryptionType: 'AES-256' })

function openEncryptedStore(): KeyValueStore {
	const report = (error: unknown) => Sentry.captureException(error, { tags: { area: 'authStorage' } })
	let meta: MMKV | undefined
	try {
		meta = createMMKV({ id: META_ID })
	} catch (error) {
		// Same recovery as the encrypted store. Without it a memory session can't mark the stored one stale.
		report(error)
		try {
			deleteMMKV(META_ID)
			meta = createMMKV({ id: META_ID })
		} catch (retryError) {
			report(retryError)
		}
	}
	const memory = () => createMemoryStore(() => meta?.set(STALE_FLAG, 'true'))

	let key: string
	try {
		key = readOrCreateKey()
	} catch (error) {
		report(error)
		return memory()
	}

	let store: MMKV
	try {
		store = openMMKV(key)
	} catch (error) {
		// A file MMKV can't open would fail on every start: drop it (it can't be read anyway) and retry once.
		report(error)
		try {
			deleteMMKV(STORE_ID)
			store = openMMKV(key)
		} catch (retryError) {
			report(retryError)
			return memory()
		}
	}

	// A session was signed in from memory: both stored sessions are outdated, the plain one included
	// (a first upgrade could otherwise migrate it now and bring back the previous account).
	const stale = !!meta?.getString(STALE_FLAG)
	if (stale) {
		store.clearAll()
		if (existsMMKV(LEGACY_ID)) deleteMMKV(LEGACY_ID)
	}

	if (store.getString(SENTINEL_KEY) !== SENTINEL_VALUE) {
		// New store, an interrupted migration, or a key that can't decrypt it (restored backup, reset
		// keychain): start clean. Leftover bytes were written with the old key, never in plain text.
		store.clearAll()
		copyLegacyInto(store)
		store.set(SENTINEL_KEY, SENTINEL_VALUE)
	}
	// Only after the sentinel: a crash before this point re-runs the copy on the next start.
	if (existsMMKV(LEGACY_ID)) deleteMMKV(LEGACY_ID)
	if (stale) meta?.remove(STALE_FLAG)

	return store
}

function openStore(): KeyValueStore {
	// MMKV on web can't encrypt (localStorage); keep the plain store there.
	if (Platform.OS !== 'ios' && Platform.OS !== 'android') return createMMKV({ id: LEGACY_ID })
	return openEncryptedStore()
}

let opened: KeyValueStore | undefined
const store = () => (opened ??= openStore())

/**
 * Auth session and auth store persistence. On iOS and Android an AES-256 MMKV instance whose key lives
 * in the Keychain / Keystore (expo-secure-store). Opened on first use, so a keychain problem can't
 * crash the app at import; it degrades to a memory store for that run (the user signs in again).
 */
export const authStorage: KeyValueStore = {
	getString: key => store().getString(key),
	set: (key, value) => store().set(key, value),
	remove: key => store().remove(key),
}
