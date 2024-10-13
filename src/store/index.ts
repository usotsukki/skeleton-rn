import { create } from 'zustand'
import { withSlices } from 'zustand-slices'
import { persist } from 'zustand/middleware'
import authSlice from './authSlice'
import persistConfig from './persistConfig'
import toastSlice from './toastSlice'

export const useStore = create(persist(withSlices(authSlice, toastSlice), persistConfig))
