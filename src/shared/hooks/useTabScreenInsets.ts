import { useHeaderHeight } from 'expo-router/react-navigation'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const IOS_TAB_BAR_BASE_HEIGHT = 49
const IOS_TAB_BAR_GAP = 12
const ANDROID_BOTTOM_PADDING = 110

/**
 * Content padding for a screen inside a tab stack. iOS: the header is transparent and the native tab
 * bar floats over content, so pad by the header height and the tab bar. Android: the custom header
 * takes layout space; only the bottom navigation needs clearing.
 */
export function useTabScreenInsets() {
	const headerHeight = useHeaderHeight()
	const insets = useSafeAreaInsets()

	if (Platform.OS === 'ios') {
		return { paddingTop: headerHeight, paddingBottom: insets.bottom + IOS_TAB_BAR_BASE_HEIGHT + IOS_TAB_BAR_GAP }
	}
	return { paddingTop: 0, paddingBottom: ANDROID_BOTTOM_PADDING }
}
