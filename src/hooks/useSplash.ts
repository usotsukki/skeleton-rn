import { create } from 'zustand'

interface SplashStore {
	isSplashFinished: boolean
	setSplashFinished: () => void
}

const useSplash = create<SplashStore>(set => ({
	isSplashFinished: false,
	setSplashFinished: () => set({ isSplashFinished: true }),
}))

export default useSplash
