import { isRepoError } from '@app/shared/api/db/errors'

/**
 * A timed-out request has already waited the full `REST_REQUEST_TIMEOUT_MS` (see
 * `fetchWithTimeout.ts`); the usual retry count would keep a screen loading for most of a minute
 * before an error state can show. One retry covers the transient case (a socket that died
 * mid-handover). Every other failure keeps the caller's retry budget.
 *
 * Query-level `retry` overrides the client default, so a query that sets its own count should use
 * `createQueryRetryPolicy(n)` rather than a bare number.
 */
export const TIMEOUT_RETRY_COUNT = 1

export function createQueryRetryPolicy(maxRetries: number) {
	return (failureCount: number, error: Error): boolean => {
		const limit = isRepoError(error) && error.code === 'timeout' ? TIMEOUT_RETRY_COUNT : maxRetries
		return failureCount < limit
	}
}
