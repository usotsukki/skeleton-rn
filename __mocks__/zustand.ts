/**
 * Resets every zustand store to its initial state after each test (zustand's documented testing
 * pattern). Activated by `jest.mock('zustand')` in `src/test/setup.ts`; a root manual
 * mock for a node module is not applied on its own.
 *
 * `getInitialState()` is the state before persist hydration, so persisted stores reset to their
 * defaults, not to whatever the MMKV mock held when the store was created.
 */
import { act } from '@testing-library/react-native'
import type * as Zustand from 'zustand'

const actual = jest.requireActual<typeof Zustand>('zustand')
const { create: actualCreate, createStore: actualCreateStore } = actual

export const { useStore } = actual

const storeResetFns = new Set<() => void>()

function track<T, S extends Zustand.StoreApi<T>>(store: S): S {
	const initialState = store.getInitialState()
	storeResetFns.add(() => store.setState(initialState, true))
	return store
}

const createUncurried = <T>(stateCreator: Zustand.StateCreator<T>) =>
	track<T, Zustand.UseBoundStore<Zustand.StoreApi<T>>>(actualCreate(stateCreator))

// Supports both `create(fn)` and the curried `create<T>()(fn)`.
export const create = (<T>(stateCreator?: Zustand.StateCreator<T>) =>
	typeof stateCreator === 'function' ? createUncurried(stateCreator) : createUncurried) as typeof Zustand.create

const createStoreUncurried = <T>(stateCreator: Zustand.StateCreator<T>) =>
	track<T, Zustand.StoreApi<T>>(actualCreateStore(stateCreator))

export const createStore = (<T>(stateCreator?: Zustand.StateCreator<T>) =>
	typeof stateCreator === 'function'
		? createStoreUncurried(stateCreator)
		: createStoreUncurried) as typeof Zustand.createStore

afterEach(async () => {
	await act(() => {
		storeResetFns.forEach(reset => reset())
	})
	// Persisted stores write their reset state back to storage; setup.ts's own clear runs before this
	// hook (hooks run in registration order), so empty the MMKV mock again.
	jest.requireMock<{ __clearAllStores: () => void }>('react-native-mmkv').__clearAllStores()
})
