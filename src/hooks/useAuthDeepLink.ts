import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { getAuthErrorMessage } from '@app/api/auth'
import { isPasswordRecoveryUrl, restoreSupabaseSessionFromUrl } from '@app/api/supabase/deepLinks'
import { PASSWORD_RECOVERY_PENDING, useAuthStore } from './useAuth'
import useToast from './useToast'

type ReplaceRoute = (href: string) => void
type ShowToast = (message: string, style?: 'success' | 'error' | 'info') => void

interface HandleAuthDeepLinkDeps {
	replace: ReplaceRoute
	showToast: ShowToast
}

async function handleAuthDeepLinkUrl(
	url: string | null,
	{ replace, showToast }: HandleAuthDeepLinkDeps,
): Promise<void> {
	if (!url) return

	const setRecoveryUserId = useAuthStore.getState().setPasswordRecoveryUserId
	const recoveryIntent = isPasswordRecoveryUrl(url)
	if (recoveryIntent) {
		setRecoveryUserId(PASSWORD_RECOVERY_PENDING)
	}

	const dropRecoveryPrefetch = () => {
		if (recoveryIntent) setRecoveryUserId(null)
	}

	try {
		const { handled, type, userId } = await restoreSupabaseSessionFromUrl(url)

		if (handled && type === 'recovery') {
			setRecoveryUserId(userId ?? null)
			replace('/ResetPassword')
			return
		}

		dropRecoveryPrefetch()
	} catch (error) {
		dropRecoveryPrefetch()
		console.error('[authDeepLink] failed', error)

		const message = getAuthErrorMessage(error)
		if (message) {
			showToast(message, 'error')
		}
	}
}

/** Subscribes to app URLs and runs Supabase email-link / recovery handling. */
export function useAuthDeepLink() {
	const router = useRouter()
	const showToast = useToast(s => s.showToast)

	useEffect(() => {
		const replace = (href: string) => router.replace(href as never)
		const deps: HandleAuthDeepLinkDeps = { replace, showToast }

		Linking.getInitialURL()
			.then(url => handleAuthDeepLinkUrl(url, deps))
			.catch(err => console.error('[authDeepLink] initial URL failed', err))

		const subscription = Linking.addEventListener('url', event => handleAuthDeepLinkUrl(event.url, deps))

		return () => subscription.remove()
	}, [router, showToast])
}
