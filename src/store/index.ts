import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface State {
	language: string
}

interface Actions {
	changeLanguage: () => void
}

interface Store extends State, Actions {}

export const useStore = create<Store>()(
	devtools(
		immer(set => ({
			language: 'en-US',
			changeLanguage: () =>
				set(state => {
					state.language = state.language === 'en-US' ? 'en-GB' : 'en-US'
				}),
		})),
	),
)

export const selectLanguage = (state: Store) => state.language
export const selectLanguageSelector = (state: Store) => state.changeLanguage
