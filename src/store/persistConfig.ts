import { createJSONStorage, PersistOptions, StateStorage } from 'zustand/middleware'
import { zustandStorage } from '@app/storage'
import { Store } from './types'

const persistStorage: StateStorage = {
	setItem: (name, value) => zustandStorage.set(name, value),
	getItem: name => zustandStorage.getString(name) || null,
	removeItem: name => zustandStorage.delete(name),
}

const persistConfig: PersistOptions<Store> = {
	name: 'rootStore',
	storage: createJSONStorage(() => persistStorage),
	partialize: state => ({ count: state.count }) as Store,
}

export default persistConfig
