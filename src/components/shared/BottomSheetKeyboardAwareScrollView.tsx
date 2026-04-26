import {
	type BottomSheetScrollViewMethods,
	createBottomSheetScrollableComponent,
	SCROLLABLE_TYPE,
} from '@gorhom/bottom-sheet'
import type { BottomSheetScrollViewProps } from '@gorhom/bottom-sheet/src/components/bottomSheetScrollable/types'
import type { ComponentType } from 'react'
import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native'
import { KeyboardAwareScrollView, type KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller'
import Reanimated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const AnimatedScrollView = Reanimated.createAnimatedComponent<ScrollViewProps>(KeyboardAwareScrollView as never)

const BaseScrollView = createBottomSheetScrollableComponent<BottomSheetScrollViewMethods, BottomSheetScrollViewProps>(
	SCROLLABLE_TYPE.SCROLLVIEW,
	AnimatedScrollView,
)

const MIN_SAFE_BOTTOM = 24
const PADDING_H = 20

type Props = BottomSheetScrollViewProps &
	KeyboardAwareScrollViewProps & {
		extraBottomPadding?: number
		contentContainerStyle?: StyleProp<ViewStyle>
	}

const KeyboardAwareBottomSheetScrollView = BaseScrollView as ComponentType<Props>

export default function BottomSheetKeyboardAwareScrollView({
	extraBottomPadding = 0,
	contentContainerStyle,
	bottomOffset = 40,
	keyboardShouldPersistTaps = 'handled',
	scrollEventThrottle = 16,
	showsVerticalScrollIndicator = false,
	...rest
}: Props) {
	const insets = useSafeAreaInsets()
	const paddingBottom = Math.max(insets.bottom, MIN_SAFE_BOTTOM) + extraBottomPadding

	return (
		<KeyboardAwareBottomSheetScrollView
			bottomOffset={bottomOffset}
			contentContainerStyle={[{ flexGrow: 1, paddingHorizontal: PADDING_H, paddingBottom }, contentContainerStyle]}
			keyboardShouldPersistTaps={keyboardShouldPersistTaps}
			scrollEventThrottle={scrollEventThrottle}
			showsVerticalScrollIndicator={showsVerticalScrollIndicator}
			{...rest}
		/>
	)
}
