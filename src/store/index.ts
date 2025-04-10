import { create } from 'zustand'
import { withSlices } from 'zustand-slices'
import { persist } from 'zustand/middleware'
import persistConfig from './persistConfig'
import { authSlice } from './slices'

export const useGlobalStore = create(persist(withSlices(authSlice), persistConfig))
