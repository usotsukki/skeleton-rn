import { renderHook } from '@testing-library/react-native'
import { useFeatureFlag, useFeatureFlags, useFeatureFlagWithPayload } from 'posthog-react-native'
import { useFeatureGate, useFeatureGateState, useFeaturePayload, useFeatureVariant } from '../useFeatureFlag'

// With a token (the no-token case is in useFeatureFlag.unconfigured.test.ts: the flag is read at import).
jest.mock('@app/shared/api/analytics', () => ({
	...jest.requireActual('@app/shared/api/analytics'),
	isAnalyticsConfigured: true,
}))

const FLAG = 'template-demo'

describe('feature flag hooks', () => {
	it('is loading until flags arrive, then on or off', async () => {
		const { result, rerender } = await renderHook(() => useFeatureGateState(FLAG))
		expect(result.current).toBe('loading')

		jest.mocked(useFeatureFlags).mockReturnValue({ [FLAG]: true })
		jest.mocked(useFeatureFlag).mockReturnValue(true)
		await rerender({})
		expect(result.current).toBe('on')

		jest.mocked(useFeatureFlag).mockReturnValue(false)
		await rerender({})
		expect(result.current).toBe('off')
	})

	it('gates on truthy values and reports string variants', async () => {
		jest.mocked(useFeatureFlag).mockReturnValue('test')
		const gate = await renderHook(() => useFeatureGate(FLAG))
		const variant = await renderHook(() => useFeatureVariant(FLAG))
		expect(gate.result.current).toBe(true)
		expect(variant.result.current).toBe('test')

		jest.mocked(useFeatureFlag).mockReturnValue(undefined)
		await gate.rerender({})
		expect(gate.result.current).toBe(false)
	})

	it('passes the payload through', async () => {
		jest.mocked(useFeatureFlagWithPayload).mockReturnValue([true, { title: 'Hi' }])
		const { result } = await renderHook(() => useFeaturePayload(FLAG))
		expect(result.current).toEqual([true, { title: 'Hi' }])
	})
})
