import { Text, TextInput } from 'react-native'
import { colors } from './colors'

/** @ts-expect-error default props */
if (!Text?.defaultProps) {
	/** @ts-expect-error default props */
	Text.defaultProps = {}
}
/** @ts-expect-error default props */
if (!TextInput?.defaultProps) {
	/** @ts-expect-error default props */
	TextInput.defaultProps = {}
}

// @ts-expect-error default props
Text.defaultProps.allowFontScaling = false
// @ts-expect-error default props
TextInput.defaultProps.allowFontScaling = false
// @ts-expect-error default props
TextInput.defaultProps.selectionColor = colors.accent
// @ts-expect-error default props — Android-only, removes extra ascent/descent padding that offsets text from center
TextInput.defaultProps.includeFontPadding = false
