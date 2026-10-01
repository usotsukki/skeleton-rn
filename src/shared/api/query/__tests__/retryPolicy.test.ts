import { RepoError } from '@app/shared/api/db/errors'
import { createQueryRetryPolicy, TIMEOUT_RETRY_COUNT } from '../retryPolicy'

describe('createQueryRetryPolicy', () => {
	const policy = createQueryRetryPolicy(3)

	it('retries ordinary failures up to the given budget', () => {
		const error = RepoError.Upstream('items.list', new Error('boom'))
		expect(policy(0, error)).toBe(true)
		expect(policy(2, error)).toBe(true)
		expect(policy(3, error)).toBe(false)
	})

	it('retries a timed-out request only once, whatever the budget', () => {
		const error = RepoError.Timeout('items.list')
		expect(policy(0, error)).toBe(true)
		expect(policy(TIMEOUT_RETRY_COUNT, error)).toBe(false)
		expect(createQueryRetryPolicy(10)(1, error)).toBe(false)
	})

	it('treats non-repo errors as ordinary failures', () => {
		expect(policy(2, new Error('plain'))).toBe(true)
		expect(policy(3, new Error('plain'))).toBe(false)
	})
})
