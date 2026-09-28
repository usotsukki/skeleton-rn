import { renderHook } from '@testing-library/react-native'
import { usePathname, useSegments } from 'expo-router'
import { posthog } from '@app/api/analytics'
import { useScreenTracking } from '../useScreenTracking'

jest.mock('expo-router', () => ({ usePathname: jest.fn(), useSegments: jest.fn() }))

describe('useScreenTracking', () => {
	it('sends the route pattern as the screen name with the concrete path, once per route', async () => {
		jest.mocked(usePathname).mockReturnValue('/pet/42')
		jest.mocked(useSegments).mockReturnValue(['(app)', 'pet', '[petId]'] as never)
		const { rerender } = await renderHook(() => useScreenTracking())
		await rerender({})
		expect(posthog.screen).toHaveBeenCalledTimes(1)
		expect(posthog.screen).toHaveBeenCalledWith('(app)/pet/[petId]', { pathname: '/pet/42' })

		jest.mocked(usePathname).mockReturnValue('/Settings')
		jest.mocked(useSegments).mockReturnValue(['(app)', 'Settings'] as never)
		await rerender({})
		expect(posthog.screen).toHaveBeenLastCalledWith('(app)/Settings', { pathname: '/Settings' })
	})
})
