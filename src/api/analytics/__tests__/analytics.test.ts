import { posthog } from '../client'
import { resetAnalytics, syncAnalyticsUser, trackEvent } from '../index'

describe('syncAnalyticsUser', () => {
	it('identifies a user from any auth event, including a cold start', () => {
		syncAnalyticsUser('u1', 'INITIAL_SESSION')
		syncAnalyticsUser('u1', 'SIGNED_IN')
		expect(posthog.identify).toHaveBeenNthCalledWith(1, 'u1')
		expect(posthog.identify).toHaveBeenNthCalledWith(2, 'u1')
		expect(posthog.reset).not.toHaveBeenCalled()
	})

	it('resets only on sign-out, not on a signed-out cold start', () => {
		syncAnalyticsUser(null, 'INITIAL_SESSION')
		expect(posthog.reset).not.toHaveBeenCalled()

		syncAnalyticsUser(null, 'SIGNED_OUT')
		expect(posthog.reset).toHaveBeenCalledTimes(1)
		expect(posthog.identify).not.toHaveBeenCalled()
	})
})

describe('resetAnalytics', () => {
	it('keeps the opt-out and the install/device keys the SDK keeps by default', () => {
		resetAnalytics()
		expect(posthog.reset).toHaveBeenCalledWith([
			'opted_out',
			'installed_app_build',
			'installed_app_version',
			'device_id',
		])
	})
})

describe('trackEvent', () => {
	it('captures typed events with their properties', () => {
		trackEvent('signed_in', { method: 'google' })
		trackEvent('sign_up_submitted')
		expect(posthog.capture).toHaveBeenNthCalledWith(1, 'signed_in', { method: 'google' })
		expect(posthog.capture).toHaveBeenNthCalledWith(2, 'sign_up_submitted', undefined)
	})
})
