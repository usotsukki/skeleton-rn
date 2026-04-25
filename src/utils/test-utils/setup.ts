/**
 * Global Jest mocks applied to every test via setupFilesAfterEach.
 * Add reusable mocks here rather than duplicating in individual test files.
 */

// Wrap React Query notifications in act() so React state updates are always inside act()
// boundaries, eliminating "not wrapped in act(...)" console warnings in hook tests.
const { notifyManager } = require('@tanstack/react-query')
const { act } = require('@testing-library/react-native')
notifyManager.setNotifyFunction((fn: () => void) => act(fn))

jest.mock('react-native-mmkv', () => {
	const stores = new Map<string, Map<string, string>>()

	function getStore(id: string) {
		let store = stores.get(id)
		if (!store) {
			store = new Map<string, string>()
			stores.set(id, store)
		}
		return store
	}

	return {
		createMMKV: jest.fn(({ id }: { id: string }) => {
			const store = getStore(id)
			return {
				get size() {
					return Array.from(store.values()).reduce((sum, value) => sum + value.length, 0)
				},
				set: jest.fn((key: string, value: string) => store.set(key, value)),
				getString: jest.fn((key: string) => store.get(key)),
				remove: jest.fn((key: string) => store.delete(key)),
				clearAll: jest.fn(() => store.clear()),
				getAllKeys: jest.fn(() => Array.from(store.keys())),
				trim: jest.fn(),
				recrypt: jest.fn(),
			}
		}),
	}
})

jest.mock('expo-router', () => ({
	useRouter: () => ({
		replace: jest.fn(),
		push: jest.fn(),
		back: jest.fn(),
	}),
	useLocalSearchParams: () => ({}),
	usePathname: () => '/',
	useSegments: () => [],
}))
