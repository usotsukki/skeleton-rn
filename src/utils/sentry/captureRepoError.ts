import * as Sentry from '@sentry/react-native'
import { isRepoError, type RepoErrorCode } from '@app/api/db/errors'

const CAPTURE_CODES: ReadonlySet<RepoErrorCode> = new Set(['upstream', 'conflict', 'forbidden'])

export function captureRepoError(err: unknown): void {
	if (!isRepoError(err)) {
		if (err instanceof Error) Sentry.captureException(err)
		return
	}
	if (!CAPTURE_CODES.has(err.code)) return
	Sentry.withScope(scope => {
		scope.setTag('repo.scope', err.scope)
		scope.setTag('repo.code', err.code)
		if (err.data) scope.setContext('repo.data', err.data)
		if (err.cause !== undefined) {
			scope.setContext('repo.cause', { value: String(err.cause) })
		}
		Sentry.captureException(err)
	})
}
