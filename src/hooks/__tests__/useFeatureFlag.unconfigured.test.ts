import { renderHook } from '@testing-library/react-native'
import { useFeatureGateState } from '../useFeatureFlag'

jest.mock('@app/api/analytics', () => ({ ...jest.requireActual('@app/api/analytics'), isAnalyticsConfigured: false }))

it('reads off (never loading) without a PostHog token, since a disabled client never loads flags', async () => {
	const { result } = await renderHook(() => useFeatureGateState('template-demo'))
	expect(result.current).toBe('off')
})
