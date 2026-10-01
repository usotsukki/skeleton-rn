import { fireEvent, screen } from '@testing-library/react-native'
import { posthog } from '@app/shared/api/analytics'
import { renderWithAppProviders } from '@app/test/render'
import Settings from '../SettingsScreen'

jest.mock('@app/shared/api/analytics', () => ({
	...jest.requireActual('@app/shared/api/analytics'),
	isAnalyticsConfigured: true,
}))
// Settings also reads the current language.
jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en', changeLanguage: jest.fn() } }),
}))
jest.mock('@app/features/auth/hooks/useAuth', () => {
	const store = { user: { uid: 'u1', email: 'a@b.co', displayName: null } }
	return {
		__esModule: true,
		default: () => ({ signOut: jest.fn(), loading: false }),
		useAuthStore: <T,>(selector: (s: typeof store) => T) => selector(store),
	}
})

describe('Settings analytics switch', () => {
	it('is on by default and opts out when turned off', async () => {
		await renderWithAppProviders(<Settings />)
		const toggle = screen.getByTestId('settings-analytics')
		expect(screen.getByLabelText('settingsScreen.shareAnalytics')).toBeTruthy()
		expect(toggle.props.accessibilityState?.checked).toBe(true)

		await fireEvent.press(toggle)
		expect(posthog.optOut).toHaveBeenCalledTimes(1)
		expect(screen.getByTestId('settings-analytics').props.accessibilityState?.checked).toBe(false)
	})
})
