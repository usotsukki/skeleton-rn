import i18next from 'i18next'
import { getErrorData } from '@app/utils'

/**
 * Maps Supabase Auth and OAuth surface errors to user-facing i18n strings, or `null` when the user
 * intentionally dismissed a flow (no toast). Pure — safe to test without a Supabase client.
 */
export function getAuthErrorMessage(error: unknown): string | null {
	const { message } = getErrorData(error)
	const m = message.toLowerCase()

	if (m.includes('invalid login credentials') || m.includes('email not confirmed') || m.includes('invalid grant')) {
		return i18next.t('error.invalidEmailOrPassword')
	}
	if (m.includes('user already registered')) return i18next.t('error.emailAlreadyInUse')
	if (m.includes('password should be at least')) return i18next.t('error.shortPassword')
	if (m.includes('email link is invalid') || (m.includes('link is invalid') && m.includes('expired'))) {
		return i18next.t('error.passwordResetLinkInvalid')
	}
	if (m.includes('network')) return i18next.t('error.networkError')
	if (m.includes('provider is not enabled')) return i18next.t('error.providerDisabled')
	if (m.includes('google') && m.includes('cancel')) return null
	// Google rejects the app's package + signing SHA-1 (no matching Android OAuth client in the web client's project).
	if (m.includes('developer_error') || m.includes('non-recoverable sign in failure')) {
		if (__DEV__) {
			console.warn(
				'[getAuthErrorMessage] Google Sign-In is not configured for this build: register its package name and ' +
					'signing SHA-1 as an Android OAuth client in the same Google Cloud project as the web client id.',
			)
		}
		return i18next.t('error.googleSignInMisconfigured')
	}
	if (m.includes('email address') && m.includes('invalid')) return i18next.t('error.invalidEmail')
	if (m.includes('rate limit') || m.includes('over_email_send_rate_limit')) return i18next.t('error.emailRateLimit')

	if (__DEV__) {
		// Unmapped: keep the original for inspectability; avoid re-wrapping and losing the stack.
		console.error('[getAuthErrorMessage] unmapped error', error)
	}
	return i18next.t('error.genericAuth')
}
