import React, { createContext, useContext, useEffect } from 'react'
import { Easing, type SharedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'

const PULSE_DURATION = 1200

const SkeletonPulseContext = createContext<SharedValue<number> | null>(null)

export function SkeletonPulseProvider({ children }: { children: React.ReactNode }) {
	const progress = useSharedValue(0)

	useEffect(() => {
		progress.value = withRepeat(
			withTiming(1, { duration: PULSE_DURATION / 2, easing: Easing.inOut(Easing.ease) }),
			-1,
			true,
		)
	}, [progress])

	return <SkeletonPulseContext.Provider value={progress}>{children}</SkeletonPulseContext.Provider>
}

export function useSkeletonPulse(): SharedValue<number> {
	const ctx = useContext(SkeletonPulseContext)
	const local = useSharedValue(0)
	useEffect(() => {
		if (ctx) return
		local.value = withRepeat(
			withTiming(1, { duration: PULSE_DURATION / 2, easing: Easing.inOut(Easing.ease) }),
			-1,
			true,
		)
	}, [ctx, local])
	return ctx ?? local
}
