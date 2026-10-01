import { createJSONStorage, type StateStorage } from 'zustand/middleware'
import { type KeyValueStore, zustandStorage } from '@app/shared/storage'

/** Zustand `persist` storage on an MMKV instance. Pass a dedicated instance to keep a store's data apart. */
export function createPersistStorage<S>(storage: KeyValueStore = zustandStorage) {
	const stateStorage: StateStorage = {
		setItem: (name, value) => storage.set(name, value),
		getItem: name => storage.getString(name) || null,
		removeItem: name => storage.remove(name),
	}
	return createJSONStorage<S>(() => stateStorage)
}
