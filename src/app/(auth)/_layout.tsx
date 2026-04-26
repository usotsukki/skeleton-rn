import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '@app/hooks/useAuth'

/**
 * Unauthenticated stack. Redirects to (app) when a session exists,
 * unless we're mid password-recovery flow (ResetPassword lives here).
 */
export default function AuthLayout() {
	const user = useAuthStore(s => s.user)
	const recoveryUid = useAuthStore(s => s.passwordRecoveryUserId)

	if (user && !recoveryUid) {
		return <Redirect href="/Home" />
	}

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: 'slide_from_right',
				animationDuration: 200,
			}}
		/>
	)
}
