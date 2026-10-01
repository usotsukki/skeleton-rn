import { posthog } from '../client'
import { syncAnalyticsUser, trackEvent } from '../index'

jest.mock('@app/shared/env', () => ({ ...jest.requireActual('@app/shared/env'), POSTHOG_PROJECT_TOKEN: undefined }))

describe('trackEvent without a PostHog token', () => {
	it('prints the event in dev instead of sending it', () => {
		const log = jest.spyOn(console, 'log').mockImplementation(() => undefined)

		trackEvent('signed_in', { method: 'email' })

		expect(posthog.capture).not.toHaveBeenCalled()
		expect(log).toHaveBeenCalledWith('[analytics] event signed_in', { method: 'email' })
		log.mockRestore()
	})

	it('leaves the disabled client alone on auth events', () => {
		syncAnalyticsUser('u1', 'SIGNED_IN')
		syncAnalyticsUser(null, 'SIGNED_OUT')

		expect(posthog.identify).not.toHaveBeenCalled()
		expect(posthog.reset).not.toHaveBeenCalled()
	})

	it('prints nothing outside dev', () => {
		const log = jest.spyOn(console, 'log').mockImplementation(() => undefined)
		const dev = __DEV__
		// @ts-expect-error __DEV__ is a read-only global in the type definitions
		globalThis.__DEV__ = false

		trackEvent('signed_in', { method: 'email' })

		// @ts-expect-error restore
		globalThis.__DEV__ = dev
		expect(log).not.toHaveBeenCalled()
		log.mockRestore()
	})
})
