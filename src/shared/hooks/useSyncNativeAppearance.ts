import { useEffect } from 'react'
import { Appearance, Platform } from 'react-native'
import { useThemeStore } from '@app/shared/theme/themeStore'

/**
 * Points the native appearance at the app theme; `system` maps to `unspecified`, which follows the
 * device (app.json `userInterfaceStyle: 'automatic'`).
 *
 * - iOS: native views (the liquid-glass tab bar and header buttons, `DynamicColorIOS` colors, alerts)
 *   resolve against the window's trait collection, not the JS theme; without this they keep the old
 *   appearance after an in-app theme switch until something forces a relayout.
 * - Android: switches AppCompat's night mode, so native dialogs (Alert) match the app. MainActivity
 *   declares `uiMode` in `configChanges`, so this is an `onConfigurationChanged`, not a recreate.
 * - Web: react-native-web has no `setColorScheme`.
 */
export function useSyncNativeAppearance() {
	const mode = useThemeStore(s => s.mode)

	useEffect(() => {
		if (Platform.OS === 'web') return
		Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode)
	}, [mode])
}
