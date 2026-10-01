import { useEffect, useRef } from 'react'
import { AppState, type AppStateStatus } from 'react-native'

export type AppStateChangeHandler = (next: AppStateStatus, prev: AppStateStatus) => void

/**
 * Subscribes to React Native {@link AppState} changes. The listener receives
 * `(nextState, previousState)` after each transition.
 */
export function useAppStateChange(listener: AppStateChangeHandler) {
	const listenerRef = useRef(listener)
	listenerRef.current = listener
	const appStateRef = useRef(AppState.currentState)

	useEffect(() => {
		const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
			const prev = appStateRef.current
			appStateRef.current = next
			listenerRef.current(next, prev)
		})
		return () => sub.remove()
	}, [])
}
