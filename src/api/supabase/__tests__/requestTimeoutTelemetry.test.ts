import NetInfo from '@react-native-community/netinfo'
import * as Sentry from '@sentry/react-native'
import { __resetRequestTimeoutTelemetryForTests, reportRequestTimeout } from '../requestTimeoutTelemetry'

jest.mock('@sentry/react-native', () => ({ addBreadcrumb: jest.fn(), captureMessage: jest.fn() }))

jest.mock('@react-native-community/netinfo', () => ({
	__esModule: true,
	default: {
		fetch: jest.fn(() => Promise.resolve({ type: 'cellular', isConnected: true })),
		addEventListener: jest.fn(() => () => undefined),
	},
}))

async function flushMicrotasks() {
	await Promise.resolve()
	await Promise.resolve()
	await Promise.resolve()
}

describe('reportRequestTimeout', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		__resetRequestTimeoutTelemetryForTests()
	})

	it('leaves a breadcrumb every time but captures one message per path per session', async () => {
		reportRequestTimeout({ method: 'GET', pathname: '/rest/v1/items', timeoutMs: 15_000 })
		reportRequestTimeout({ method: 'GET', pathname: '/rest/v1/items', timeoutMs: 15_000 })
		reportRequestTimeout({ method: 'GET', pathname: '/rest/v1/profiles', timeoutMs: 15_000 })
		await flushMicrotasks()

		expect(Sentry.addBreadcrumb).toHaveBeenCalledTimes(3)
		expect(Sentry.captureMessage).toHaveBeenCalledTimes(2)
		expect(Sentry.captureMessage).toHaveBeenCalledWith(
			'request-timeout',
			expect.objectContaining({
				level: 'warning',
				tags: expect.objectContaining({
					'request.method': 'GET',
					'request.path': '/rest/v1/items',
					'network.type': 'cellular',
				}),
				extra: { timeoutMs: 15_000 },
			}),
		)
	})

	it('still captures when the connection type cannot be read', async () => {
		;(NetInfo.fetch as jest.Mock).mockRejectedValueOnce(new Error('no native module'))

		reportRequestTimeout({ method: 'POST', pathname: '/rest/v1/rpc/some_function', timeoutMs: 15_000 })
		await flushMicrotasks()

		expect(Sentry.captureMessage).toHaveBeenCalledWith(
			'request-timeout',
			expect.objectContaining({ tags: expect.objectContaining({ 'network.type': 'unknown' }) }),
		)
	})
})
