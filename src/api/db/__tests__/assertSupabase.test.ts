import { assertSupabaseAffected, assertSupabaseOk } from '../assertSupabase'
import { isRepoError, type RepoErrorCode } from '../errors'

function codeOf(fn: () => void): RepoErrorCode | 'none' {
	try {
		fn()
		return 'none'
	} catch (err) {
		if (!isRepoError(err)) throw err
		return err.code
	}
}

describe('assertSupabaseOk', () => {
	it('does nothing without an error', () => {
		expect(codeOf(() => assertSupabaseOk(null, 'items.list'))).toBe('none')
	})

	it('maps PostgREST / Postgres codes to typed repo errors', () => {
		expect(codeOf(() => assertSupabaseOk({ message: 'no rows', code: 'PGRST116' }, 's'))).toBe('not_found')
		expect(codeOf(() => assertSupabaseOk({ message: 'dup', code: '23505' }, 's'))).toBe('conflict')
		expect(codeOf(() => assertSupabaseOk({ message: 'denied', code: '42501' }, 's'))).toBe('forbidden')
		expect(codeOf(() => assertSupabaseOk({ message: 'boom', code: 'XX000' }, 's'))).toBe('upstream')
	})

	it('recognises a timed-out fetch in the flattened PostgREST message', () => {
		const flattened = { message: 'RequestTimeoutError: REQUEST_TIMEOUT: GET /rest/v1/items exceeded 15000ms', code: '' }
		expect(codeOf(() => assertSupabaseOk(flattened, 'items.list'))).toBe('timeout')
	})
})

describe('assertSupabaseAffected', () => {
	it('passes when the write touched rows', () => {
		expect(codeOf(() => assertSupabaseAffected([{ id: 1 }], null, 'items.delete'))).toBe('none')
	})

	it('treats a zero-row write (filtered by RLS) as forbidden', () => {
		expect(codeOf(() => assertSupabaseAffected([], null, 'items.delete'))).toBe('forbidden')
		expect(codeOf(() => assertSupabaseAffected(null, null, 'items.delete'))).toBe('forbidden')
	})

	it('reports the underlying error first', () => {
		expect(codeOf(() => assertSupabaseAffected([], { message: 'dup', code: '23505' }, 's'))).toBe('conflict')
	})
})
