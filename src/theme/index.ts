import { Colors, Spacings, ThemeManager, Typography } from 'react-native-ui-lib'
import { colors, fonts, headingSizes, headingWeights, textSizes, textWeights, typeHierarchy } from './designSystem'

Colors.loadColors({
	...colors,
})

Typography.loadTypographies({
	h1: { ...headingSizes['30px / 34px'], ...fonts.SFProRounded.black },
	h2: { ...headingSizes['28px / 33px'], ...fonts.SFProRounded.heavy },
	sfProRounded: { ...fonts.SFProRounded.medium },
})

Spacings.loadSpacings({
	page: 20,
})

ThemeManager.setComponentTheme('Text', {
	sfProRounded: true,
})

export { colors, fonts, headingSizes, headingWeights, textSizes, textWeights, typeHierarchy }
