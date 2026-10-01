import { fireEvent, screen } from '@testing-library/react-native'
import * as Clipboard from 'expo-clipboard'
import * as Updates from 'expo-updates'
import type React from 'react'
import { renderWithAppProviders } from '@app/test/render'
import { AppVersionInfo } from '../AppVersionInfo'

// The published date is formatted in the current language.
jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}))
jest.mock('expo-application', () => ({ nativeApplicationVersion: '1.2.3', nativeBuildVersion: '45' }))
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(() => Promise.resolve(true)) }))
jest.mock('expo-updates', () => ({
	isEmbeddedLaunch: true,
	updateId: null,
	createdAt: null,
	channel: 'production',
	runtimeVersion: '1.2.3',
}))
// The real popover opens only after a native `measure` callback, which Jest's host components never
// call: an in-place stand-in with the same open/close contract.
jest.mock('@rn-primitives/popover', () => {
	const { createContext, useContext, useState } = jest.requireActual<typeof React>('react')
	const { Pressable, View } = jest.requireActual<typeof import('react-native')>('react-native')
	const Open = createContext<{ open: boolean; setOpen: (open: boolean) => void }>({ open: false, setOpen: () => {} })
	const Passthrough = ({ children }: { children: React.ReactNode }) => children
	return {
		Root: ({ children }: { children: React.ReactNode }) => {
			const [open, setOpen] = useState(false)
			return <Open.Provider value={{ open, setOpen }}>{children}</Open.Provider>
		},
		Trigger: (props: React.ComponentProps<typeof Pressable>) => {
			const { open, setOpen } = useContext(Open)
			return <Pressable {...props} onPress={() => setOpen(!open)} />
		},
		Portal: Passthrough,
		Overlay: Passthrough,
		Close: Passthrough,
		Content: (props: React.ComponentProps<typeof View>) => (useContext(Open).open ? <View {...props} /> : null),
	}
})

const updates = Updates as { -readonly [K in keyof typeof Updates]: (typeof Updates)[K] }

describe('AppVersionInfo', () => {
	afterEach(() => {
		updates.isEmbeddedLaunch = true
		updates.updateId = null
		updates.createdAt = null
	})

	it('shows the store version and build, and the embedded bundle on tap', async () => {
		await renderWithAppProviders(<AppVersionInfo />)
		expect(screen.getByText('1.2.3 (45)')).toBeTruthy()
		expect(screen.queryByTestId('app-update-info')).toBeNull()

		await fireEvent.press(screen.getByTestId('app-version'))
		expect(screen.getByText('settingsScreen.version.embedded')).toBeTruthy()
		expect(screen.getByText('settingsScreen.version.channel: production')).toBeTruthy()
		expect(screen.queryByTestId('app-update-copy')).toBeNull()
	})

	it('shows the running update id and copies it', async () => {
		updates.isEmbeddedLaunch = false
		updates.updateId = '0198f1e2-aaaa-bbbb-cccc-1234567890ab'
		updates.createdAt = new Date('2026-09-30T12:00:00Z')
		await renderWithAppProviders(<AppVersionInfo />)

		await fireEvent.press(screen.getByTestId('app-version'))
		expect(screen.getByText('settingsScreen.version.update: 0198f1e2-aaaa-bbbb-cccc-1234567890ab')).toBeTruthy()

		await fireEvent.press(screen.getByTestId('app-update-copy'))
		expect(Clipboard.setStringAsync).toHaveBeenCalledWith('0198f1e2-aaaa-bbbb-cccc-1234567890ab')
	})
})
