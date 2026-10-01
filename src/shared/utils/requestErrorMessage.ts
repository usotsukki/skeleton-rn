import type { TFunction } from 'i18next'
import { isRepoError } from '@app/shared/api/db/errors'
import { isRequestTimeoutMessage } from '@app/shared/api/supabase/fetchWithTimeout'
import { repoErrorMessage } from './repoErrorMessage'

// Messages a failed fetch surfaces with: RN's XHR fetch ("Network request failed") and expo/fetch
// ("fetch failed: …"); supabase-js keeps them in `message` (PostgREST prefixes the error name).
const NETWORK_FAILURE = /network request failed|fetch failed/i

function messageOf(err: unknown): string {
	if (err !== null && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
		return err.message
	}
	return ''
}

/** True when a request never reached the server (offline, DNS, connection reset). */
export function isNetworkFailure(err: unknown): boolean {
	const cause = isRepoError(err) ? err.cause : err
	return NETWORK_FAILURE.test(messageOf(cause)) || NETWORK_FAILURE.test(messageOf(err))
}

/**
 * User-facing message for a failed request: timeouts and network failures first (whatever layer
 * wrapped them), then typed repo errors, then a generic fallback. Never returns `err.message`.
 */
export function requestErrorMessage(err: unknown, t: TFunction): string {
	const cause = isRepoError(err) ? err.cause : err
	if ((isRepoError(err) && err.code === 'timeout') || isRequestTimeoutMessage(messageOf(cause))) {
		return t('error.repo.timeout')
	}
	if (isNetworkFailure(err)) return t('error.networkError')
	return repoErrorMessage(err, t, t('modules.common.somethingWentWrong'))
}
