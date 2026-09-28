import i18next from 'i18next'
import { isRequestTimeoutMessage } from '@app/api/supabase/fetchWithTimeout'
import { getErrorData } from '@app/utils'

export type AuthFormField = 'email' | 'password'

/** Error keys that belong to one input; everything else is shown for the whole form. */
const FIELD_OF_KEY: Record<string, AuthFormField> = {
	'error.emailAlreadyInUse': 'email',
	'error.invalidEmail': 'email',
	'error.shortPassword': 'password',
	'error.weakPassword': 'password',
	'error.samePassword': 'password',
}

/**
 * Maps Supabase Auth and OAuth surface errors to user-facing i18n strings, or `null` when the user
 * intentionally dismissed a flow (no toast). Pure — safe to test without a Supabase client.
 */
export function getAuthErrorMessage(error: unknown): string | null {
	const key = getAuthErrorKey(error)
	return key ? i18next.t(key) : null
}

/**
 * For auth forms: the error's i18n key and the input it belongs to (`field` unset = the whole form,
 * e.g. wrong credentials, which stay generic so they don't reveal whether an account exists).
 * `null` when the user dismissed the flow.
 */
export function getAuthFormError(error: unknown): { key: string; field?: AuthFormField } | null {
	const key = getAuthErrorKey(error)
	return key ? { key, field: FIELD_OF_KEY[key] } : null
}

function getAuthErrorKey(error: unknown): string | null {
	const { code, message } = getErrorData(error)
	const m = message.toLowerCase()

	// Supabase checks the password before the confirmation, so this doesn't reveal unknown addresses.
	if (code === 'email_not_confirmed' || m.includes('email not confirmed')) return 'error.emailNotConfirmed'
	if (code === 'invalid_credentials' || m.includes('invalid login credentials') || m.includes('invalid grant')) {
		return 'error.invalidEmailOrPassword'
	}
	if (code === 'user_already_exists' || m.includes('user already registered')) return 'error.emailAlreadyInUse'
	if (code === 'same_password') return 'error.samePassword'
	// AuthWeakPasswordError lists why: 'length' | 'characters' | 'pwned'.
	if (code === 'weak_password')
		return weakPasswordReasons(error).join() === 'length' ? 'error.shortPassword' : 'error.weakPassword'
	if (m.includes('password should be at least')) return 'error.shortPassword'
	if (m.includes('email link is invalid') || (m.includes('link is invalid') && m.includes('expired'))) {
		return 'error.passwordResetLinkInvalid'
	}
	// auth-js wraps a rejected fetch (offline, or our client-side timeout) as AuthRetryableFetchError with status 0.
	if (isRequestTimeoutMessage(message) || isFailedAuthFetch(error)) return 'error.networkError'
	if (m.includes('network')) return 'error.networkError'
	if (m.includes('provider is not enabled')) return 'error.providerDisabled'
	if (m.includes('google') && m.includes('cancel')) return null
	// Google rejects the app's package + signing SHA-1 (no matching Android OAuth client in the web client's project).
	if (m.includes('developer_error') || m.includes('non-recoverable sign in failure')) {
		if (__DEV__) {
			console.warn(
				'[getAuthErrorMessage] Google Sign-In is not configured for this build: register its package name and ' +
					'signing SHA-1 as an Android OAuth client in the same Google Cloud project as the web client id.',
			)
		}
		return 'error.googleSignInMisconfigured'
	}
	if (code === 'email_address_invalid' || (m.includes('email address') && m.includes('invalid')))
		return 'error.invalidEmail'
	// Supabase 429s often say only "For security purposes, you can only request this after N seconds."; the code tells them apart.
	if (
		code === 'over_email_send_rate_limit' ||
		m.includes('email rate limit') ||
		m.includes('over_email_send_rate_limit')
	) {
		return 'error.emailRateLimit'
	}
	if (code.startsWith('over_') || m.includes('rate limit') || m.includes('for security purposes')) {
		return 'error.tooManyRequests'
	}

	if (__DEV__) {
		// Unmapped: keep the original for inspectability; avoid re-wrapping and losing the stack.
		console.error('[getAuthErrorMessage] unmapped error', error)
	}
	return 'error.genericAuth'
}

function weakPasswordReasons(error: unknown): unknown[] {
	const reasons = error && typeof error === 'object' && 'reasons' in error ? error.reasons : undefined
	return Array.isArray(reasons) ? reasons : []
}

function isFailedAuthFetch(error: unknown): boolean {
	return (
		error instanceof Error && error.name === 'AuthRetryableFetchError' && (error as { status?: unknown }).status === 0
	)
}
