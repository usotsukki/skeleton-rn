import * as Sentry from '@sentry/react-native'
import { onlineManager, QueryClient, QueryObserver } from '@tanstack/react-query'
import { AppState, type AppStateStatus } from 'react-native'
import { startSlowQueryWatchdog } from '../slowQueryWatchdog'

jest.mock('@sentry/react-native', () => ({ captureMessage: jest.fn() }))

describe('startSlowQueryWatchdog', () => {
	let queryClient: QueryClient
	let stop: (() => void) | null = null
	let settlePendingQueries: Array<() => void> = []
	let unsubscribers: Array<() => void> = []
	let appStateHandlers: Array<(state: AppStateStatus) => void> = []

	function pendingQuery() {
		return new Promise<string>(resolve => {
			settlePendingQueries.push(() => resolve('ok'))
		})
	}

	/** Fetch with a mounted observer, like a screen showing a spinner. */
	function observedPendingQuery(queryKey: unknown[]) {
		const observer = new QueryObserver(queryClient, {
			queryKey,
			queryFn: pendingQuery,
			retry: false,
		})
		unsubscribers.push(observer.subscribe(() => undefined))
	}

	function setAppState(state: AppStateStatus) {
		Object.defineProperty(AppState, 'currentState', { value: state, configurable: true })
		appStateHandlers.forEach(handler => handler(state))
	}

	beforeEach(() => {
		jest.useFakeTimers()
		jest.spyOn(console, 'warn').mockImplementation(() => undefined)
		appStateHandlers = []
		jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
			appStateHandlers.push(handler as (state: AppStateStatus) => void)
			return { remove: jest.fn() } as ReturnType<typeof AppState.addEventListener>
		})
		setAppState('active')
		queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } })
		settlePendingQueries = []
		unsubscribers = []
	})

	afterEach(async () => {
		stop?.()
		stop = null
		settlePendingQueries.forEach(settle => settle())
		settlePendingQueries = []
		unsubscribers.forEach(unsubscribe => unsubscribe())
		unsubscribers = []
		await Promise.resolve()
		queryClient.clear()
		jest.clearAllTimers()
		jest.useRealTimers()
		jest.restoreAllMocks()
	})

	it('reports an observed query stuck in fetching exactly once, with its key', async () => {
		observedPendingQuery(['items', 'detail', 'item-1'])

		stop = startSlowQueryWatchdog(queryClient)
		// Sweep 1 (5s) registers the fetch; sweep 4 (20s) crosses the 15s threshold.
		await jest.advanceTimersByTimeAsync(30_000)

		expect(Sentry.captureMessage).toHaveBeenCalledTimes(1)
		expect(Sentry.captureMessage).toHaveBeenCalledWith(
			'slow-query',
			expect.objectContaining({
				extra: expect.objectContaining({ queryKey: ['items', 'detail', 'item-1'] }),
			}),
		)
	})

	it('does not report queries that settle before the threshold', async () => {
		queryClient.prefetchQuery({
			queryKey: ['fast'],
			queryFn: () =>
				new Promise(resolve => {
					setTimeout(() => resolve('ok'), 8_000)
				}),
			retry: false,
		})

		stop = startSlowQueryWatchdog(queryClient)
		await jest.advanceTimersByTimeAsync(30_000)

		expect(Sentry.captureMessage).not.toHaveBeenCalled()
	})

	it('never reports observer-less fetches (prefetch churn is not a spinner)', async () => {
		queryClient.prefetchQuery({
			queryKey: ['prefetch-only'],
			queryFn: pendingQuery,
			retry: false,
		})

		stop = startSlowQueryWatchdog(queryClient)
		await jest.advanceTimersByTimeAsync(60_000)

		expect(Sentry.captureMessage).not.toHaveBeenCalled()
	})

	it('does not count backgrounded time toward the threshold', async () => {
		observedPendingQuery(['slow-across-background'])

		stop = startSlowQueryWatchdog(queryClient)
		// 10s foreground: clock running, below threshold.
		await jest.advanceTimersByTimeAsync(10_000)

		setAppState('background')
		await jest.advanceTimersByTimeAsync(120_000)
		setAppState('active')

		// 10s after resume: a naive clock would read 140s; a foreground-only clock
		// restarted on resume reads ~5s. No report either way below 15s.
		await jest.advanceTimersByTimeAsync(10_000)
		expect(Sentry.captureMessage).not.toHaveBeenCalled()

		// Cross the threshold with genuine foreground time after resume.
		await jest.advanceTimersByTimeAsync(20_000)
		expect(Sentry.captureMessage).toHaveBeenCalledTimes(1)
		expect(Sentry.captureMessage).toHaveBeenCalledWith(
			'slow-query',
			expect.objectContaining({
				extra: expect.objectContaining({ elapsedMs: expect.any(Number) }),
			}),
		)
		const { elapsedMs } = (Sentry.captureMessage as jest.Mock).mock.calls[0][1].extra
		expect(elapsedMs).toBeLessThan(30_000)
	})

	it('does not report a query paused by the online manager (offline is not a hung fetch)', async () => {
		onlineManager.setOnline(false)
		try {
			observedPendingQuery(['paused-offline'])

			stop = startSlowQueryWatchdog(queryClient)
			await jest.advanceTimersByTimeAsync(60_000)

			expect(Sentry.captureMessage).not.toHaveBeenCalled()
		} finally {
			onlineManager.setOnline(true)
		}
	})
})
