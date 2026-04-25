export type RepoErrorCode = 'not_found' | 'forbidden' | 'conflict' | 'validation' | 'upstream'

export type RepoErrorData = Record<string, unknown>

function extractCauseMessage(scope: string, cause: unknown): string | undefined {
	if (
		cause !== null &&
		typeof cause === 'object' &&
		'message' in cause &&
		typeof (cause as { message: unknown }).message === 'string'
	) {
		return `[${scope}] ${(cause as { message: string }).message}`
	}
	return undefined
}

export class RepoError extends Error {
	readonly code: RepoErrorCode
	readonly scope: string
	readonly data?: RepoErrorData

	constructor(code: RepoErrorCode, scope: string, cause?: unknown, message?: string, data?: RepoErrorData) {
		super(message ?? `[${scope}] ${code}`, cause !== undefined ? { cause } : undefined)
		this.name = 'RepoError'
		this.code = code
		this.scope = scope
		this.data = data
	}

	static NotFound(scope: string, id?: string, data?: RepoErrorData): RepoError {
		return new RepoError('not_found', scope, undefined, id ? `[${scope}] ${id} not found` : undefined, data)
	}

	static Forbidden(scope: string, data?: RepoErrorData): RepoError {
		return new RepoError('forbidden', scope, undefined, undefined, data)
	}

	static Conflict(scope: string, detail?: string, data?: RepoErrorData): RepoError {
		return new RepoError('conflict', scope, undefined, detail, data)
	}

	static Validation(scope: string, detail?: string, data?: RepoErrorData): RepoError {
		return new RepoError('validation', scope, undefined, detail, data)
	}

	static Upstream(scope: string, cause: unknown, message?: string, data?: RepoErrorData): RepoError {
		return new RepoError('upstream', scope, cause, message ?? extractCauseMessage(scope, cause), data)
	}
}

export function isRepoError(err: unknown): err is RepoError {
	return err instanceof RepoError
}
