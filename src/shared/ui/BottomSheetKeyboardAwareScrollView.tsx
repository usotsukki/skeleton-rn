import {
	type BottomSheetScrollViewMethods,
	createBottomSheetScrollableComponent,
	SCROLLABLE_TYPE,
} from '@gorhom/bottom-sheet'
import type { BottomSheetScrollViewProps } from '@gorhom/bottom-sheet/src/components/bottomSheetScrollable/types'
import type { ComponentType } from 'react'
import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native'
import type { KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller'
import Reanimated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import KeyboardScrollView, { SCREEN_BOTTOM_PADDING } from './KeyboardScrollView'

const AnimatedScrollView = Reanimated.createAnimatedComponent<ScrollViewProps>(KeyboardScrollView as never)

const BaseScrollView = createBottomSheetScrollableComponent<BottomSheetScrollViewMethods, BottomSheetScrollViewProps>(
	SCROLLABLE_TYPE.SCROLLVIEW,
	AnimatedScrollView,
)

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
	scrollEventThrottle = 16,
	...rest
}: Props) {
	const insets = useSafeAreaInsets()
	const paddingBottom = Math.max(insets.bottom, SCREEN_BOTTOM_PADDING) + extraBottomPadding

	return (
		<KeyboardAwareBottomSheetScrollView
			contentContainerStyle={[{ paddingHorizontal: PADDING_H, paddingBottom }, contentContainerStyle]}
			scrollEventThrottle={scrollEventThrottle}
			{...rest}
		/>
	)
}
