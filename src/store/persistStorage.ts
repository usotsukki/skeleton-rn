import { createJSONStorage, StateStorage } from 'zustand/middleware'
import { zustandStorage } from '@app/storage'

const persistStorage: StateStorage = {
	setItem: (name, value) => zustandStorage.set(name, value),
	getItem: name => zustandStorage.getString(name) || null,
	removeItem: name => zustandStorage.remove(name),
}

export const zustandPersistStorage = createJSONStorage(() => persistStorage)
