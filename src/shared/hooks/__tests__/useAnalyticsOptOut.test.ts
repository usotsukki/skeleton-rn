import { act, renderHook } from '@testing-library/react-native'
import { posthog } from '@app/shared/api/analytics'
import { useAnalyticsOptOut } from '../useAnalyticsOptOut'

describe('useAnalyticsOptOut', () => {
	it("starts from PostHog's persisted choice and opts out / in", async () => {
		const { result } = await renderHook(() => useAnalyticsOptOut())
		expect(result.current.enabled).toBe(true)

		await act(async () => result.current.setEnabled(false))
		expect(posthog.optOut).toHaveBeenCalledTimes(1)
		expect(result.current.enabled).toBe(false)

		await act(async () => result.current.setEnabled(true))
		expect(posthog.optIn).toHaveBeenCalledTimes(1)
		expect(result.current.enabled).toBe(true)
	})

	it('shows an earlier opt-out as off', async () => {
		;(posthog as { optedOut: boolean }).optedOut = true
		const { result } = await renderHook(() => useAnalyticsOptOut())
		expect(result.current.enabled).toBe(false)
	})
})
