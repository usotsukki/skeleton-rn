import { RepoError } from '@app/shared/api/db/errors'
import { RequestTimeoutError } from '@app/shared/api/supabase/fetchWithTimeout'
import { isNetworkFailure, requestErrorMessage } from '../requestErrorMessage'

const t = ((key: string) => key) as never

describe('requestErrorMessage', () => {
	it('maps timeouts from any layer', () => {
		expect(requestErrorMessage(RepoError.Timeout('items.list'), t)).toBe('error.repo.timeout')
		expect(
			requestErrorMessage(new RequestTimeoutError({ method: 'GET', pathname: '/rest/v1/items', timeoutMs: 15_000 }), t),
		).toBe('error.repo.timeout')
	})

	it('maps network failures, raw or wrapped', () => {
		expect(requestErrorMessage(new TypeError('Network request failed'), t)).toBe('error.networkError')
		expect(requestErrorMessage(new Error('fetch failed: The Internet connection appears to be offline.'), t)).toBe(
			'error.networkError',
		)
		const flattened = { message: 'Error: fetch failed: offline', code: '' }
		expect(requestErrorMessage(RepoError.Upstream('items.list', flattened), t)).toBe('error.networkError')
		expect(isNetworkFailure(new Error('duplicate key'))).toBe(false)
	})

	it('falls back to repo codes, then a generic message, never the raw text', () => {
		expect(requestErrorMessage(RepoError.Forbidden('items.delete'), t)).toBe('error.repo.forbidden')
		expect(requestErrorMessage(new Error('violates constraint "items_name_key"'), t)).toBe(
			'modules.common.somethingWentWrong',
		)
		expect(requestErrorMessage(null, t)).toBe('modules.common.somethingWentWrong')
	})
})
