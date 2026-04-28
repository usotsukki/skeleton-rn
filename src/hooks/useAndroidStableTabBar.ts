import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import { Platform } from 'react-native'
import { AndroidSoftInputModes, KeyboardController } from 'react-native-keyboard-controller'

// KAS internally calls useResizeMode() → forces SOFT_INPUT_ADJUST_RESIZE.
// On Android that shrinks the window, which lifts NativeTabs' BottomNavigationView
// with the keyboard. Override to ADJUST_NOTHING after focus so tabs stay anchored
// at the bottom (covered by the keyboard). KAS scroll-into-view still works because
// it tracks keyboard height via RNKC events, not Activity resize.
export function useAndroidStableTabBar() {
	useFocusEffect(
		useCallback(() => {
			if (Platform.OS !== 'android') return
			KeyboardController.setInputMode(AndroidSoftInputModes.SOFT_INPUT_ADJUST_NOTHING)
			return () => KeyboardController.setDefaultMode()
		}, []),
	)
}
