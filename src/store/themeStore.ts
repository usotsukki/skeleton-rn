import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from './persistStorage'

export type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeStore {
	mode: ThemeMode
	setMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeStore>()(
	persist(
		set => ({
			mode: 'dark',
			setMode: (mode: ThemeMode) => set({ mode }),
		}),
		{
			name: 'theme',
			storage: createPersistStorage(),
		},
	),
)
