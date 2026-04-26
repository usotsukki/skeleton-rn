import { Redirect } from 'expo-router'
import { useAuthStore } from '@app/hooks/useAuth'

/**
 * Root index. Picks a starting route before nested layouts run.
 * If we only checked `!user` → /Welcome, users mid password-recovery (session + `passwordRecoveryUserId`) would
 * land on Welcome instead of ResetPassword. `(auth)/_layout` also gates on recovery, but / must send them
 * to the right screen on cold start.
 */
export default function Index() {
	const user = useAuthStore(s => s.user)
	const passwordRecoveryUserId = useAuthStore(s => s.passwordRecoveryUserId)

	if (user && !passwordRecoveryUserId) return <Redirect href="/Home" />
	if (passwordRecoveryUserId) return <Redirect href="/ResetPassword" />
	return <Redirect href="/Welcome" />
}
