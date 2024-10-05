import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import persistConfig from './persistConfig'
import { Store } from './types'

export const useStore = create<Store>()(
	persist(
		immer(set => ({
			count: 0,
			increment: () =>
				set(state => {
					state.count += 1
				}),
			decrement: () =>
				set(state => {
					state.count -= 1
				}),
		})),
		persistConfig,
	),
)

export const selectCount = (state: Store) => state.count
export const selectIncrement = (state: Store) => state.increment
export const selectDecrement = (state: Store) => state.decrement
