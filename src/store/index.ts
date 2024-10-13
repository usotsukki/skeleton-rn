import { create } from 'zustand'
import { withSlices } from 'zustand-slices'
import { persist } from 'zustand/middleware'
import authSlice from './authSlice'
import persistConfig from './persistConfig'

export const useStore = create(persist(withSlices(authSlice), persistConfig))
