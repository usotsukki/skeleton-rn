import { useAppStateChange } from '@app/shared/hooks/useAppStateChange'
import { setAuthAutoRefresh } from '../api'

/** Runs Supabase token auto-refresh only while the app is in the foreground. Mount once, at the root. */
export function useAuthAutoRefresh() {
	useAppStateChange(next => setAuthAutoRefresh(next === 'active'))
}
