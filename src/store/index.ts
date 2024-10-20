import { create } from 'zustand'
import { withSlices } from 'zustand-slices'
import { persist } from 'zustand/middleware'
import persistConfig from './persistConfig'
import { authSlice, connectionSlice, toastSlice } from './slices'

export const useStore = create(persist(withSlices(authSlice, toastSlice, connectionSlice), persistConfig))
