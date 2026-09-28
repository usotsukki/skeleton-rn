import { createClient } from '@supabase/supabase-js'
import {
	createFetchWithTimeout,
	isRequestTimeoutMessage,
	RequestTimeoutError,
	resolveRequestTimeoutMs,
	REST_REQUEST_TIMEOUT_MS,
	UPLOAD_REQUEST_TIMEOUT_MS,
} from '../fetchWithTimeout'

const ORIGIN = 'https://example.supabase.co'

/** A fetch that never answers on its own but honours abort, like a dead pooled socket. */
function hangingFetch() {
	return jest.fn((_input: RequestInfo | URL, init?: RequestInit) => {
		return new Promise<Response>((_resolve, reject) => {
			init?.signal?.addEventListener('abort', () => {
				reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
			})
		})
	})
}

/** Headers arrive, then the body stalls; like `expo/fetch`, abort does not reject the pending read. */
function stalledBodyFetch() {
	const response = {
		ok: true,
		status: 200,
		text: jest.fn(
			() =>
				new Promise<string>(() => {
					// never settles
				}),
		),
	} as unknown as Response
	return { response, base: jest.fn(() => Promise.resolve(response)) }
}

function swallow(promise: Promise<unknown>) {
	return promise.then(
		() => 'resolved' as const,
		(error: unknown) => error,
	)
}

describe('resolveRequestTimeoutMs', () => {
	it('gives storage uploads the long budget and everything else the REST budget', () => {
		expect(resolveRequestTimeoutMs('/storage/v1/object/avatars/a.jpg', { method: 'POST', body: 'bytes' })).toBe(
			UPLOAD_REQUEST_TIMEOUT_MS,
		)
		expect(resolveRequestTimeoutMs('/storage/v1/object/avatars/a.jpg', { method: 'GET' })).toBe(REST_REQUEST_TIMEOUT_MS)
		expect(resolveRequestTimeoutMs('/rest/v1/items', { method: 'POST', body: '{}' })).toBe(REST_REQUEST_TIMEOUT_MS)
		expect(resolveRequestTimeoutMs('/auth/v1/token', { method: 'POST', body: '{}' })).toBe(REST_REQUEST_TIMEOUT_MS)
	})
})

describe('createFetchWithTimeout', () => {
	beforeEach(() => {
		jest.useFakeTimers()
	})

	afterEach(() => {
		jest.clearAllTimers()
		jest.useRealTimers()
	})

	it('rejects a hung request with RequestTimeoutError after the REST budget and reports it', async () => {
		const onTimeout = jest.fn()
		const fetchWithTimeout = createFetchWithTimeout(hangingFetch() as unknown as typeof fetch, { onTimeout })

		const outcome = swallow(fetchWithTimeout(`${ORIGIN}/rest/v1/items?select=id`, { method: 'GET' }))

		await jest.advanceTimersByTimeAsync(REST_REQUEST_TIMEOUT_MS - 1)
		expect(onTimeout).not.toHaveBeenCalled()

		await jest.advanceTimersByTimeAsync(1)
		const error = await outcome
		expect(error).toBeInstanceOf(RequestTimeoutError)
		expect((error as RequestTimeoutError).code).toBe('ABORT_ERR')
		expect(isRequestTimeoutMessage((error as Error).message)).toBe(true)
		expect(onTimeout).toHaveBeenCalledTimes(1)
		expect(onTimeout).toHaveBeenCalledWith({
			method: 'GET',
			pathname: '/rest/v1/items',
			timeoutMs: REST_REQUEST_TIMEOUT_MS,
		})
	})

	it('lets a storage upload run past the REST budget', async () => {
		const onTimeout = jest.fn()
		const fetchWithTimeout = createFetchWithTimeout(hangingFetch() as unknown as typeof fetch, { onTimeout })

		const outcome = swallow(
			fetchWithTimeout(`${ORIGIN}/storage/v1/object/avatars/a.jpg`, { method: 'POST', body: 'x' }),
		)

		await jest.advanceTimersByTimeAsync(REST_REQUEST_TIMEOUT_MS + 1_000)
		expect(onTimeout).not.toHaveBeenCalled()

		await jest.advanceTimersByTimeAsync(UPLOAD_REQUEST_TIMEOUT_MS)
		expect(await outcome).toBeInstanceOf(RequestTimeoutError)
		expect(onTimeout).toHaveBeenCalledWith(expect.objectContaining({ timeoutMs: UPLOAD_REQUEST_TIMEOUT_MS }))
	})

	it('bounds a body that stalls after the headers arrived', async () => {
		const { response, base } = stalledBodyFetch()
		const onTimeout = jest.fn()
		const fetchWithTimeout = createFetchWithTimeout(base as unknown as typeof fetch, { onTimeout })

		const res = await fetchWithTimeout(`${ORIGIN}/rest/v1/items`)
		expect(res).toBe(response)
		const body = swallow(res.text())

		await jest.advanceTimersByTimeAsync(REST_REQUEST_TIMEOUT_MS)
		expect(await body).toBeInstanceOf(RequestTimeoutError)
		expect(onTimeout).toHaveBeenCalledTimes(1)
	})

	it('bounds json() on a response whose json() reads through this.text(), like expo/fetch', async () => {
		class StalledFetchResponse {
			text(): Promise<string> {
				return new Promise<string>(() => {
					// never settles
				})
			}

			async json(): Promise<unknown> {
				return JSON.parse(await this.text())
			}
		}
		const onTimeout = jest.fn()
		const base = jest.fn(() => Promise.resolve(new StalledFetchResponse() as unknown as Response))
		const fetchWithTimeout = createFetchWithTimeout(base as unknown as typeof fetch, { onTimeout })

		const res = await fetchWithTimeout(`${ORIGIN}/auth/v1/token`, { method: 'POST', body: '{}' })
		const body = swallow(res.json())

		await jest.advanceTimersByTimeAsync(REST_REQUEST_TIMEOUT_MS)
		expect(await body).toBeInstanceOf(RequestTimeoutError)
		expect(onTimeout).toHaveBeenCalledTimes(1)
		expect(jest.getTimerCount()).toBe(0)
	})

	it('does not report a timeout when the body is never read', async () => {
		const { base } = stalledBodyFetch()
		const onTimeout = jest.fn()
		const fetchWithTimeout = createFetchWithTimeout(base as unknown as typeof fetch, { onTimeout })

		await fetchWithTimeout(`${ORIGIN}/rest/v1/items`, { method: 'DELETE' })
		await jest.advanceTimersByTimeAsync(REST_REQUEST_TIMEOUT_MS * 2)

		expect(onTimeout).not.toHaveBeenCalled()
		expect(jest.getTimerCount()).toBe(0)
	})

	it('passes a normal response through and clears the timer once the body is read', async () => {
		const response = { ok: true, text: () => Promise.resolve('[]') } as unknown as Response
		const onTimeout = jest.fn()
		const fetchWithTimeout = createFetchWithTimeout(
			jest.fn(() => Promise.resolve(response)) as unknown as typeof fetch,
			{
				onTimeout,
			},
		)

		const res = await fetchWithTimeout(`${ORIGIN}/rest/v1/items`)
		await expect(res.text()).resolves.toBe('[]')
		expect(jest.getTimerCount()).toBe(0)

		await jest.advanceTimersByTimeAsync(REST_REQUEST_TIMEOUT_MS * 2)
		expect(onTimeout).not.toHaveBeenCalled()
	})

	it('keeps a caller abort as a plain AbortError, not a timeout', async () => {
		const onTimeout = jest.fn()
		const fetchWithTimeout = createFetchWithTimeout(hangingFetch() as unknown as typeof fetch, { onTimeout })
		const caller = new AbortController()

		const outcome = swallow(fetchWithTimeout(`${ORIGIN}/rest/v1/items`, { signal: caller.signal }))
		caller.abort()

		const error = (await outcome) as Error
		expect(error.name).toBe('AbortError')
		expect(error).not.toBeInstanceOf(RequestTimeoutError)
		expect(onTimeout).not.toHaveBeenCalled()
		expect(jest.getTimerCount()).toBe(0)
	})

	it('surfaces a non-abort network failure unchanged', async () => {
		const failure = new TypeError('Network request failed')
		const fetchWithTimeout = createFetchWithTimeout(jest.fn(() => Promise.reject(failure)) as unknown as typeof fetch)

		await expect(fetchWithTimeout(`${ORIGIN}/rest/v1/items`)).rejects.toBe(failure)
		expect(jest.getTimerCount()).toBe(0)
	})
})

describe('through supabase-js (PostgREST)', () => {
	beforeEach(() => {
		jest.useFakeTimers()
	})

	afterEach(() => {
		jest.clearAllTimers()
		jest.useRealTimers()
	})

	it('is not retried by PostgREST and keeps the timeout marker in the flattened error', async () => {
		const base = hangingFetch()
		const client = createClient(ORIGIN, 'publishable-key', {
			global: { fetch: createFetchWithTimeout(base as unknown as typeof fetch) },
			auth: { persistSession: false, autoRefreshToken: false },
		})
		const result = client
			.from('items')
			.select('id')
			.then(r => r)
		await jest.advanceTimersByTimeAsync(REST_REQUEST_TIMEOUT_MS * 5)
		const { error } = await result

		expect(base).toHaveBeenCalledTimes(1)
		expect(isRequestTimeoutMessage(error?.message)).toBe(true)
	})
})
