import { renderHook } from '@testing-library/react-native'
import { usePathname, useSegments } from 'expo-router'
import { posthog } from '@app/api/analytics'
import { useScreenTracking } from '../useScreenTracking'

jest.mock('expo-router', () => ({ usePathname: jest.fn(), useSegments: jest.fn() }))
jest.mock('@app/env', () => ({ ...jest.requireActual('@app/env'), POSTHOG_PROJECT_TOKEN: undefined }))

it('prints the screen view in dev instead of sending it without a PostHog token', async () => {
	const log = jest.spyOn(console, 'log').mockImplementation(() => undefined)
	jest.mocked(usePathname).mockReturnValue('/Settings')
	jest.mocked(useSegments).mockReturnValue(['(app)', 'Settings'] as never)

	await renderHook(() => useScreenTracking())

	expect(posthog.screen).not.toHaveBeenCalled()
	expect(log).toHaveBeenCalledWith('[analytics] screen (app)/Settings', { pathname: '/Settings' })
	log.mockRestore()
})
