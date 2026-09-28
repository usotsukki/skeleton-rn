import { setAuthAutoRefresh } from '@app/api/auth'
import { useAppStateChange } from './useAppStateChange'

/** Runs Supabase token auto-refresh only while the app is in the foreground. Mount once, at the root. */
export function useAuthAutoRefresh() {
	useAppStateChange(next => setAuthAutoRefresh(next === 'active'))
}
