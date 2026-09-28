import { posthog } from '../client'
import { trackEvent } from '../index'

jest.mock('@app/env', () => ({ ...jest.requireActual('@app/env'), POSTHOG_PROJECT_TOKEN: undefined }))

describe('trackEvent without a PostHog token', () => {
	it('prints the event in dev instead of sending it', () => {
		const log = jest.spyOn(console, 'log').mockImplementation(() => undefined)

		trackEvent('signed_in', { method: 'email' })

		expect(posthog.capture).not.toHaveBeenCalled()
		expect(log).toHaveBeenCalledWith('[analytics] event signed_in', { method: 'email' })
		log.mockRestore()
	})
})
