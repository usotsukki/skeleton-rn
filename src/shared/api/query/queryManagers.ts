import NetInfo from '@react-native-community/netinfo'
import { focusManager, onlineManager } from '@tanstack/react-query'
import { AppState, Platform } from 'react-native'

/**
 * TanStack Query has no network or focus signal on React Native (TanStack's React Native guide).
 *
 * - Online: bound to NetInfo, so offline queries pause instead of failing (or hanging) and
 *   `refetchOnReconnect` refires active stale queries when the connection returns. `isConnected:
 *   null` (unknown, common on Android right after boot) counts as online; pausing on it would hold
 *   every query at cold start.
 * - Focus: bound to AppState, so `refetchOnWindowFocus` refetches active stale queries when the app
 *   returns to the foreground. Web keeps TanStack's own `visibilitychange` listener.
 *
 * Each `setEventListener` replaces (and unsubscribes) the previous one, so calling this again is safe.
 */
export function bindQueryManagers(): void {
	onlineManager.setEventListener(setOnline =>
		NetInfo.addEventListener(state => {
			setOnline(state.isConnected !== false)
		}),
	)

	if (Platform.OS !== 'web') {
		focusManager.setEventListener(setFocused => {
			const subscription = AppState.addEventListener('change', status => setFocused(status === 'active'))
			return () => subscription.remove()
		})
	}
}
