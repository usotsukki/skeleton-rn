import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '@app/hooks/useAuth'

/**
 * Authenticated stack. Redirects to /Welcome when no session.
 * Wraps the (drawer) → (tabs) tree.
 */
export default function AppLayout() {
	const user = useAuthStore(s => s.user)

	if (!user) {
		return <Redirect href="/Welcome" />
	}

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: 'fade',
				animationDuration: 200,
			}}
		/>
	)
}
