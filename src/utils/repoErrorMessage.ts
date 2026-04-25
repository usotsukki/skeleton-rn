import type { TFunction } from 'i18next'
import { isRepoError, type RepoErrorCode } from '@app/api/db/errors'

const codeToI18nKey: Record<RepoErrorCode, string> = {
	not_found: 'error.repo.notFound',
	forbidden: 'error.repo.forbidden',
	conflict: 'error.repo.conflict',
	validation: 'error.repo.validation',
	upstream: 'error.repo.upstream',
}

export function repoErrorMessage(err: unknown, t: TFunction, fallback: string): string {
	if (isRepoError(err)) {
		return t(codeToI18nKey[err.code])
	}
	if (err instanceof Error) return err.message
	return fallback
}
