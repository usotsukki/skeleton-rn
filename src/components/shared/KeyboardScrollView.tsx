import { forwardRef } from 'react'
import {
	KeyboardAwareScrollView,
	type KeyboardAwareScrollViewProps,
	type KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller'

const DEFAULT_BOTTOM_OFFSET = 40

// Shared bottom padding for any keyboard-aware scroll surface (auth screens, sheet
// forms). Applied as KAS contentContainer baseline so children using `mt-auto` get
// consistent spacing above the scroll edge.
export const SCREEN_BOTTOM_PADDING = 24

const KeyboardScrollView = forwardRef<KeyboardAwareScrollViewRef, KeyboardAwareScrollViewProps>(
	function KeyboardScrollView(
		{
			bottomOffset = DEFAULT_BOTTOM_OFFSET,
			keyboardShouldPersistTaps = 'handled',
			showsVerticalScrollIndicator = false,
			contentContainerStyle,
			...rest
		},
		ref,
	) {
		return (
			<KeyboardAwareScrollView
				ref={ref}
				{...rest}
				bottomOffset={bottomOffset}
				contentContainerStyle={[{ flexGrow: 1, paddingBottom: SCREEN_BOTTOM_PADDING }, contentContainerStyle]}
				keyboardShouldPersistTaps={keyboardShouldPersistTaps}
				showsVerticalScrollIndicator={showsVerticalScrollIndicator}
			/>
		)
	},
)

export default KeyboardScrollView
