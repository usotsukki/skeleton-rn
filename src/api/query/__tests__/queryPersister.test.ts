import { QueryClient } from '@tanstack/react-query'
import { persistQueryClientRestore, persistQueryClientSave } from '@tanstack/react-query-persist-client'
import { createQueryCacheOwnership, createQueryPersistOptions, persister, queryCacheBuster } from '../queryPersister'

jest.mock('expo-application', () => ({ nativeBuildVersion: '42' }))
jest.mock('expo-updates', () => ({ updateId: 'update-1' }))

async function save(client: QueryClient, uid: string | null) {
	await persistQueryClientSave({ queryClient: client, ...createQueryPersistOptions(uid) })
	// The sync persister throttles writes by 1 s.
	await jest.advanceTimersByTimeAsync(1_000)
}

async function restoreInto(uid: string | null) {
	const client = new QueryClient()
	await persistQueryClientRestore({ queryClient: client, ...createQueryPersistOptions(uid) })
	return client
}

describe('queryPersister', () => {
	let source: QueryClient

	beforeEach(() => {
		jest.useFakeTimers()
		source = new QueryClient()
		source.setQueryData(['profile', 'user-a'], { name: 'A' })
		source.getQueryCache().build(source, { queryKey: ['search', 'x'], meta: { persist: false } })
		source.setQueryData(['search', 'x'], ['result'])
	})

	afterEach(async () => {
		source.clear()
		await persister.removeClient()
		jest.useRealTimers()
	})

	it('builds the buster from native build, OTA update and launch user', () => {
		expect(queryCacheBuster('user-a')).toBe('42-update-1-user-a')
		expect(queryCacheBuster(null)).toBe('42-update-1-anon')
	})

	it('restores persisted queries for the same user and skips opted-out ones', async () => {
		await save(source, 'user-a')
		const restored = await restoreInto('user-a')

		expect(restored.getQueryData(['profile', 'user-a'])).toEqual({ name: 'A' })
		expect(restored.getQueryData(['search', 'x'])).toBeUndefined()
	})

	it('discards a snapshot written under another launch user', async () => {
		await save(source, 'user-a')
		const restored = await restoreInto('user-b')

		expect(restored.getQueryData(['profile', 'user-a'])).toBeUndefined()
	})

	it('restores nothing after the snapshot is removed', async () => {
		await save(source, 'user-a')
		await persister.removeClient()
		const restored = await restoreInto('user-a')

		expect(restored.getQueryData(['profile', 'user-a'])).toBeUndefined()
	})

	it('drops a restored cache when the user signed out during restore', async () => {
		await save(source, 'user-a')
		const restored = await restoreInto('user-a')
		const ownership = createQueryCacheOwnership(restored, 'user-a')

		ownership.onRestored('user-a')
		expect(restored.getQueryData(['profile', 'user-a'])).toEqual({ name: 'A' })

		ownership.onRestored(null)
		expect(restored.getQueryData(['profile', 'user-a'])).toBeUndefined()
		expect((await restoreInto('user-a')).getQueryData(['profile', 'user-a'])).toBeUndefined()
	})

	it('never shows one user the cache of another after a sign-in without sign-out', () => {
		const ownership = createQueryCacheOwnership(source, 'user-a')

		ownership.onSignedIn('user-a')
		expect(source.getQueryData(['profile', 'user-a'])).toEqual({ name: 'A' })

		ownership.onSignedIn('user-b')
		expect(source.getQueryData(['profile', 'user-a'])).toBeUndefined()

		source.setQueryData(['profile', 'user-b'], { name: 'B' })
		ownership.onSignedIn('user-a')
		expect(source.getQueryData(['profile', 'user-b'])).toBeUndefined()
	})

	it('clears on sign-out and treats the next sign-in as a new owner', () => {
		const ownership = createQueryCacheOwnership(source, 'user-a')

		ownership.onSignedOut()
		expect(source.getQueryData(['profile', 'user-a'])).toBeUndefined()

		source.setQueryData(['public'], 'x')
		ownership.onSignedIn('user-a')
		expect(source.getQueryData(['public'])).toBeUndefined()
	})
})
