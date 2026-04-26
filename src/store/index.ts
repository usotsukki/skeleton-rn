/**
 * Global sliced store — currently unused.
 *
 * Use this when you need coordinated state transitions across multiple
 * domains. Until then, prefer independent stores or raw MMKVStorage.
 *
 * Example setup using zustand-slices + persist:
 *
 * ```ts
 * // src/store/slices/exampleSlice.ts
 * import { createSlice } from 'zustand-slices'
 *
 * export const exampleSlice = createSlice({
 *   name: 'example',
 *   value: { count: 0 },
 *   actions: {
 *     increment: () => state => ({ count: state.count + 1 }),
 *   },
 * })
 *
 * // src/store/index.ts
 * import { create } from 'zustand'
 * import { withSlices } from 'zustand-slices'
 * import { persist } from 'zustand/middleware'
 * import { zustandPersistStorage } from './persistStorage'
 * import { exampleSlice } from './slices/exampleSlice'
 *
 * export const useGlobalStore = create(
 *   persist(withSlices(exampleSlice), {
 *     name: 'rootStore',
 *     storage: zustandPersistStorage,
 *   }),
 * )
 * ```
 */
export {}
