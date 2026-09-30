import { act, renderHook } from '@testing-library/react-native'
import { Appearance, Platform } from 'react-native'
import { useThemeStore } from '@app/store/themeStore'
import { useSyncNativeAppearance } from '../useSyncNativeAppearance'

describe('useSyncNativeAppearance', () => {
	const originalOS = Platform.OS

	afterEach(() => {
		Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true })
	})

	it.each(['ios', 'android'])('on %s, points the native appearance at the app theme', async os => {
		Object.defineProperty(Platform, 'OS', { value: os, configurable: true })
		const setColorScheme = jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => undefined)

		const { rerender } = await renderHook(() => useSyncNativeAppearance())
		expect(setColorScheme).toHaveBeenLastCalledWith('dark')

		await act(() => useThemeStore.getState().setMode('light'))
		await rerender({})
		expect(setColorScheme).toHaveBeenLastCalledWith('light')

		await act(() => useThemeStore.getState().setMode('system'))
		await rerender({})
		expect(setColorScheme).toHaveBeenLastCalledWith('unspecified')
	})

	it('does nothing on web (react-native-web has no setColorScheme)', async () => {
		Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true })
		const setColorScheme = jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => undefined)

		await renderHook(() => useSyncNativeAppearance())
		expect(setColorScheme).not.toHaveBeenCalled()
	})
})
