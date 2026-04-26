import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { zustandStorage } from '@app/storage'

export type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeStore {
	mode: ThemeMode
	setMode: (mode: ThemeMode) => void
}

const persistStorage: StateStorage = {
	setItem: (name, value) => zustandStorage.set(name, value),
	getItem: name => zustandStorage.getString(name) || null,
	removeItem: name => zustandStorage.remove(name),
}

export const useThemeStore = create<ThemeStore>()(
	persist(
		set => ({
			mode: 'dark',
			setMode: (mode: ThemeMode) => set({ mode }),
		}),
		{
			name: 'theme',
			storage: createJSONStorage(() => persistStorage),
		},
	),
)
