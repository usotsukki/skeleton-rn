import { isRequestTimeoutMessage } from '@app/api/supabase/fetchWithTimeout'
import { RepoError } from './errors'

type SupabaseErrorLike = { message: string; code?: string } | null

/** Throws a typed `RepoError` for a Supabase `{ error }` result; no-op when `error` is null. */
export function assertSupabaseOk(error: SupabaseErrorLike, scope: string): void {
	if (!error) return
	// A rejected fetch reaches here flattened to `{ message, code: '' }`; the timeout marker in the
	// message is the only thing that survives (see fetchWithTimeout.ts).
	if (isRequestTimeoutMessage(error.message)) throw RepoError.Timeout(scope, error)
	switch (error.code) {
		case 'PGRST116':
			throw RepoError.NotFound(scope)
		case '23505':
			throw RepoError.Conflict(scope, error.message)
		case '42501':
			throw RepoError.Forbidden(scope)
		default:
			throw RepoError.Upstream(scope, error)
	}
}

/**
 * Like `assertSupabaseOk`, for an UPDATE/DELETE (with `.select()`) that must touch at least one
 * row. RLS filters rows silently: a write the caller cannot see returns `{ data: [], error: null }`,
 * which looks like success. Use it for writes to a row the caller just read, where zero rows means
 * the server refused rather than "already gone"; it throws Forbidden so the divergence reaches
 * Sentry (see captureRepoError) instead of a support ticket.
 */
export function assertSupabaseAffected(rows: readonly unknown[] | null, error: SupabaseErrorLike, scope: string): void {
	assertSupabaseOk(error, scope)
	if (!rows || rows.length === 0) throw RepoError.Forbidden(scope)
}
