import { Text, TextInput } from 'react-native'
import { darkColors } from './colors'

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
// Module scope can't follow the theme; accent is identical in both palettes.
// @ts-expect-error default props
TextInput.defaultProps.selectionColor = darkColors.accent
// @ts-expect-error default props — Android-only, removes extra ascent/descent padding that offsets text from center
TextInput.defaultProps.includeFontPadding = false
