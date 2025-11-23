import { createJSONStorage, PersistOptions, StateStorage } from 'zustand/middleware'
import { zustandStorage } from '@app/storage'
import { RootStore } from './slices'

const persistStorage: StateStorage = {
	setItem: (name, value) => zustandStorage.set(name, value),
	getItem: name => zustandStorage.getString(name) || null,
	removeItem: name => zustandStorage.remove(name),
}

const persistConfig: PersistOptions<RootStore> = {
	name: 'rootStore',
	storage: createJSONStorage(() => persistStorage),
}

export default persistConfig
