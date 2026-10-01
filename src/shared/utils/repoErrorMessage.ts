import type { TFunction } from 'i18next'
import { isRepoError, type RepoErrorCode } from '@app/shared/api/db/errors'

const codeToI18nKey: Record<RepoErrorCode, string> = {
	not_found: 'error.repo.notFound',
	forbidden: 'error.repo.forbidden',
	conflict: 'error.repo.conflict',
	validation: 'error.repo.validation',
	upstream: 'error.repo.upstream',
	timeout: 'error.repo.timeout',
}

export function repoErrorMessage(err: unknown, t: TFunction, fallback: string): string {
	if (isRepoError(err)) {
		return t(codeToI18nKey[err.code])
	}
	// Never surface raw Error.message: it leaks internals ("Network request failed", Postgres
	// constraint names). Diagnostics belong in Sentry via captureRepoError.
	return fallback
}
