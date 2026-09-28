import { Text, TextInput } from 'react-native'
import { darkColors } from './colors'

const MAX_FONT_SIZE_MULTIPLIER = 1.4

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

// Respect the system text size (Dynamic Type / Android font scale), capped so fixed layouts hold.
// Reaches app JSX because NativeWind/css-interop renders through createElement, which still applies
// defaultProps under React 19. Native-stack header titles are not RN Text and scale on their own.
// @ts-expect-error default props
Text.defaultProps.maxFontSizeMultiplier = MAX_FONT_SIZE_MULTIPLIER
// @ts-expect-error default props
TextInput.defaultProps.maxFontSizeMultiplier = MAX_FONT_SIZE_MULTIPLIER
// Fallback for a raw TextInput: module scope can't follow the theme, so TextField overrides it with
// the active palette's accent (light and dark accents differ).
// @ts-expect-error default props
TextInput.defaultProps.selectionColor = darkColors.accent
// @ts-expect-error default props — Android-only, removes extra ascent/descent padding that offsets text from center
TextInput.defaultProps.includeFontPadding = false
