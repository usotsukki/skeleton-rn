import { Platform } from 'react-native'
import type { KeyValueStore } from '../authStorage'

/**
 * MMKV with a model of encryption: a store remembers the key it was written with, and an instance
 * opened with another key reads nothing (MMKV decodes undecryptable data as empty). Files persist
 * across `loadAuthStorage()` calls, like app restarts.
 */
type MockFile = { key?: string; data: Map<string, string> }
const mockFiles = new Map<string, MockFile>()
const mockKeychain = new Map<string, string>()
let mockKeychainFails = false

jest.mock('react-native-mmkv', () => ({
	createMMKV: jest.fn(({ id, encryptionKey }: { id: string; encryptionKey?: string }) => {
		if (!mockFiles.has(id)) mockFiles.set(id, { key: encryptionKey, data: new Map() })
		const file = () => mockFiles.get(id) as MockFile
		const readable = () => file().key === encryptionKey
		return {
			getString: (k: string) => (readable() ? file().data.get(k) : undefined),
			set: (k: string, v: string) => {
				if (readable()) file().data.set(k, v)
			},
			remove: (k: string) => file().data.delete(k),
			getAllKeys: () => (readable() ? [...file().data.keys()] : []),
			clearAll: () => mockFiles.set(id, { key: encryptionKey, data: new Map() }),
		}
	}),
	existsMMKV: (id: string) => mockFiles.has(id),
	deleteMMKV: (id: string) => mockFiles.delete(id),
	// The shared harness empties MMKV after each test; this suite resets its own files in beforeEach.
	__clearAllStores: () => undefined,
}))

jest.mock('expo-secure-store', () => ({
	AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
	getItem: jest.fn((key: string) => {
		if (mockKeychainFails) throw new Error('User interaction is not allowed')
		return mockKeychain.get(key) ?? null
	}),
	setItem: jest.fn((key: string, value: string) => {
		if (mockKeychainFails) throw new Error('User interaction is not allowed')
		mockKeychain.set(key, value)
	}),
}))

jest.mock('expo-crypto', () => ({
	getRandomValues: (bytes: Uint8Array) => bytes.map(() => Math.floor(Math.random() * 256)),
}))

/** A fresh module instance = an app start. */
function loadAuthStorage(): KeyValueStore {
	let storage: KeyValueStore | undefined
	jest.isolateModules(() => {
		storage = jest.requireActual<typeof import('../authStorage')>('../authStorage').authStorage
	})
	return storage as KeyValueStore
}

const SECURE_STORE = jest.requireMock<{ setItem: jest.Mock }>('expo-secure-store')
const MMKV = jest.requireMock<{ createMMKV: jest.Mock }>('react-native-mmkv')

describe('authStorage', () => {
	beforeEach(() => {
		mockFiles.clear()
		mockKeychain.clear()
		mockKeychainFails = false
		jest.clearAllMocks()
	})

	it('creates a 32-character key on this device only and opens an AES-256 store with it', () => {
		loadAuthStorage().set('session', 'token')

		const [[name, key, options]] = SECURE_STORE.setItem.mock.calls
		expect(name).toBe('mmkv.auth.v2.key')
		expect(key).toMatch(/^[A-Za-z0-9]{32}$/)
		expect(options).toEqual({ keychainAccessible: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY' })
		expect(MMKV.createMMKV).toHaveBeenCalledWith({ id: 'auth.v2', encryptionKey: key, encryptionType: 'AES-256' })
	})

	it('keeps the session across restarts with the same key', () => {
		loadAuthStorage().set('session', 'token')
		expect(loadAuthStorage().getString('session')).toBe('token')
		expect(SECURE_STORE.setItem).toHaveBeenCalledTimes(1)
	})

	it('moves the plain store into the encrypted one and deletes the plain file', () => {
		mockFiles.set('auth', { data: new Map([['supabase:session', 'token']]) })

		expect(loadAuthStorage().getString('supabase:session')).toBe('token')
		expect(mockFiles.has('auth')).toBe(false)
	})

	it('redoes an interrupted migration', () => {
		mockFiles.set('auth', { data: new Map([['supabase:session', 'token']]) })
		loadAuthStorage().getString('x')
		// Simulate a crash after the copy, before the sentinel: the plain file is back, the sentinel gone.
		mockFiles.set('auth', { data: new Map([['supabase:session', 'token']]) })
		mockFiles.get('auth.v2')?.data.delete('__authStore')

		expect(loadAuthStorage().getString('supabase:session')).toBe('token')
		expect(mockFiles.has('auth')).toBe(false)
	})

	it('starts signed out when the key cannot decrypt the store (restored backup, reset keychain)', () => {
		loadAuthStorage().set('session', 'token')
		mockKeychain.set('mmkv.auth.v2.key', 'B'.repeat(32))

		const storage = loadAuthStorage()
		expect(storage.getString('session')).toBeUndefined()
		storage.set('session', 'new')
		expect(loadAuthStorage().getString('session')).toBe('new')
	})

	it('falls back to memory when the keychain fails, and drops the old session after a new sign-in', () => {
		loadAuthStorage().set('supabase:session', 'account-a')

		mockKeychainFails = true
		const fallback = loadAuthStorage()
		expect(fallback.getString('supabase:session')).toBeUndefined()
		fallback.set('supabase:session', 'account-b')
		expect(fallback.getString('supabase:session')).toBe('account-b')

		// Next start with a working keychain must not resurrect account A.
		mockKeychainFails = false
		expect(loadAuthStorage().getString('supabase:session')).toBeUndefined()
	})

	it('does not migrate the plain session after a memory sign-in on the first upgrade', () => {
		mockFiles.set('auth', { data: new Map([['supabase:session', 'account-a']]) })
		mockKeychainFails = true
		loadAuthStorage().set('supabase:session', 'account-b')

		mockKeychainFails = false
		expect(loadAuthStorage().getString('supabase:session')).toBeUndefined()
		expect(mockFiles.has('auth')).toBe(false)
	})

	it('keeps the stored session through a locked launch that only writes the signed-out state', () => {
		loadAuthStorage().set('supabase:session', 'account-a')
		mockKeychainFails = true
		const locked = loadAuthStorage()
		expect(locked.getString('supabase:session')).toBeUndefined()
		// The auth store persists `user: null` on bootstrap; Supabase may clear its (absent) session.
		locked.set('auth', '{"state":{"user":null}}')
		locked.remove('supabase:session')
		mockKeychainFails = false
		expect(loadAuthStorage().getString('supabase:session')).toBe('account-a')
	})

	it('recreates a store MMKV cannot open instead of staying in memory', () => {
		loadAuthStorage().set('supabase:session', 'account-a')
		const MMKV_MOCK = jest.requireMock<{ createMMKV: jest.Mock; deleteMMKV: (id: string) => boolean }>(
			'react-native-mmkv',
		)
		const original = MMKV_MOCK.createMMKV.getMockImplementation() as (config: { id: string }) => unknown
		// A damaged file fails on every open until it is deleted.
		let damaged = true
		const deleteOriginal = MMKV_MOCK.deleteMMKV
		const spyDelete = jest.fn((id: string) => {
			if (id === 'auth.v2') damaged = false
			return deleteOriginal(id)
		})
		MMKV_MOCK.deleteMMKV = spyDelete
		MMKV_MOCK.createMMKV.mockImplementation((config: { id: string }) => {
			if (config.id === 'auth.v2' && damaged) throw new Error('file is corrupt')
			return original(config)
		})
		try {
			const storage = loadAuthStorage()
			storage.set('supabase:session', 'account-b')
			expect(spyDelete).toHaveBeenCalledWith('auth.v2')
			expect(loadAuthStorage().getString('supabase:session')).toBe('account-b')
		} finally {
			MMKV_MOCK.createMMKV.mockImplementation(original)
			MMKV_MOCK.deleteMMKV = deleteOriginal
		}
	})

	it('does not treat an abandoned OAuth flow (PKCE verifier) as a new session', () => {
		loadAuthStorage().set('supabase:session', 'account-a')
		mockKeychainFails = true
		loadAuthStorage().set('supabase:session-code-verifier', 'verifier')
		mockKeychainFails = false
		expect(loadAuthStorage().getString('supabase:session')).toBe('account-a')
	})

	it('uses the plain store on web, where MMKV cannot encrypt', () => {
		jest.replaceProperty(Platform, 'OS', 'web')
		loadAuthStorage().set('session', 'token')
		expect(MMKV.createMMKV).toHaveBeenCalledWith({ id: 'auth' })
		expect(SECURE_STORE.setItem).not.toHaveBeenCalled()
	})
})
