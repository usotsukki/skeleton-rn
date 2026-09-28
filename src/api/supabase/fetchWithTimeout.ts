/**
 * Bounded `fetch` for the Supabase client.
 *
 * The global `fetch` is `expo/fetch` (SDK 56+), and neither native side bounds a request:
 * Android builds its OkHttp client from React Native's `OkHttpClientProvider` (connect / read /
 * write timeouts of 0) and iOS sets `timeoutInterval = 0`. A request on a pooled socket that died
 * during a network handover pends forever: TanStack Query's retry never fires because the promise
 * never settles, and the screen sits on its loading state until the app is killed.
 *
 * The deadline covers the body too. `expo/fetch` resolves at headers, and a native `text()` /
 * `arrayBuffer()` waits only for body completion, so aborting mid-body does not reject it; the
 * body readers on the returned response race the same deadline.
 *
 * A cancelled native request rejects as a generic fetch cancel, not with `signal.reason`, so a
 * timeout is detected with a flag and rethrown as `RequestTimeoutError`.
 *
 * supabase-js hands this fetch to PostgREST, Auth, Storage and Functions. PostgREST retries failed
 * GET/HEAD fetches three times unless the error looks like an abort (`name === 'AbortError'` or
 * `code === 'ABORT_ERR'`), and flattens it to `{ message: '<name>: <message>' }`. The error carries
 * `code: 'ABORT_ERR'` so a timeout is not retried there (TanStack Query's retry policy decides), and
 * `isRequestTimeoutMessage` matches the message marker anywhere in the flattened text.
 */

/** REST, auth, functions and storage reads. */
export const REST_REQUEST_TIMEOUT_MS = 15_000
/** Storage uploads on cellular: long, but bounded. */
export const UPLOAD_REQUEST_TIMEOUT_MS = 90_000

const REQUEST_TIMEOUT_MARKER = 'REQUEST_TIMEOUT:'
const STORAGE_PATH_PREFIX = '/storage/v1/'
const BODY_READERS = ['text', 'json', 'arrayBuffer', 'blob'] as const

export interface RequestTimeoutInfo {
	method: string
	pathname: string
	timeoutMs: number
}

export class RequestTimeoutError extends Error {
	/** Read by PostgREST's retry loop as an abort, so it does not retry the timed-out request. */
	readonly code = 'ABORT_ERR' as const
	readonly method: string
	readonly pathname: string
	readonly timeoutMs: number

	constructor(info: RequestTimeoutInfo, cause?: unknown) {
		super(
			`${REQUEST_TIMEOUT_MARKER} ${info.method} ${info.pathname} exceeded ${info.timeoutMs}ms`,
			cause !== undefined ? { cause } : undefined,
		)
		this.name = 'RequestTimeoutError'
		this.method = info.method
		this.pathname = info.pathname
		this.timeoutMs = info.timeoutMs
	}
}

/** True for a message a Supabase sub-client reports after `RequestTimeoutError` rejected its fetch. */
export function isRequestTimeoutMessage(message: unknown): boolean {
	return typeof message === 'string' && message.includes(REQUEST_TIMEOUT_MARKER)
}

export function describeRequest(input: RequestInfo | URL, init?: RequestInit): { method: string; url: string } {
	if (typeof input === 'string') {
		return { method: (init?.method ?? 'GET').toUpperCase(), url: input }
	}
	if (input instanceof URL) {
		return { method: (init?.method ?? 'GET').toUpperCase(), url: input.href }
	}
	return { method: (init?.method ?? input.method ?? 'GET').toUpperCase(), url: input.url }
}

function pathnameOf(url: string): string {
	try {
		return new URL(url).pathname
	} catch {
		return url
	}
}

/** Uploads are the only Supabase calls that legitimately take longer than a screen should wait. */
export function resolveRequestTimeoutMs(pathname: string, init?: RequestInit): number {
	const isUpload = pathname.startsWith(STORAGE_PATH_PREFIX) && init?.body != null
	return isUpload ? UPLOAD_REQUEST_TIMEOUT_MS : REST_REQUEST_TIMEOUT_MS
}

export interface CreateFetchWithTimeoutOptions {
	/** Called once per timed-out request, before the rejection propagates. */
	onTimeout?: (info: RequestTimeoutInfo) => void
}

export function createFetchWithTimeout(
	baseFetch: typeof fetch,
	options: CreateFetchWithTimeoutOptions = {},
): typeof fetch {
	return (input, init) => {
		const { method, url } = describeRequest(input, init)
		const pathname = pathnameOf(url)
		const info: RequestTimeoutInfo = { method, pathname, timeoutMs: resolveRequestTimeoutMs(pathname, init) }

		const controller = new AbortController()
		const upstream = init?.signal ?? null
		const abortFromUpstream = () => controller.abort()
		if (upstream) {
			if (upstream.aborted) controller.abort()
			else upstream.addEventListener('abort', abortFromUpstream)
		}

		let timedOut = false
		let pendingBodyReads = 0
		let rejectBodyReads: ((error: RequestTimeoutError) => void) | null = null
		const timeoutError = (cause?: unknown) => {
			options.onTimeout?.(info)
			return new RequestTimeoutError(info, cause)
		}
		const cleanup = () => {
			clearTimeout(timer)
			upstream?.removeEventListener('abort', abortFromUpstream)
		}
		const timer = setTimeout(() => {
			// Headers arrived and nobody is reading the body: nothing is waiting, so nothing timed out.
			if (rejectBodyReads && pendingBodyReads === 0) {
				cleanup()
				return
			}
			timedOut = true
			controller.abort()
			rejectBodyReads?.(timeoutError())
		}, info.timeoutMs)

		return baseFetch(input, { ...init, signal: controller.signal }).then(
			response => {
				const deadline = new Promise<never>((_resolve, reject) => {
					rejectBodyReads = reject
				})
				deadline.catch(() => undefined)
				for (const name of BODY_READERS) {
					const read = response[name]?.bind(response) as (() => Promise<unknown>) | undefined
					if (!read) continue
					Object.defineProperty(response, name, {
						configurable: true,
						value: () => {
							pendingBodyReads += 1
							return Promise.race([read(), deadline]).finally(() => {
								pendingBodyReads -= 1
								cleanup()
							})
						},
					})
				}
				return response
			},
			(error: unknown) => {
				cleanup()
				if (!timedOut) throw error
				throw timeoutError(error)
			},
		)
	}
}
