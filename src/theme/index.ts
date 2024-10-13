import { Assets, Colors, ThemeManager, Typography } from 'react-native-ui-lib'
import { colors, fonts, headingSizes, headingWeights, textSizes, textWeights, typeHierarchy } from './designSystem'

Colors.loadColors({
	...colors,
})

Typography.loadTypographies({
	h1: { ...headingSizes['30px / 34px'], ...fonts.SFProRounded.black },
	h2: { ...headingSizes['28px / 33px'], ...fonts.SFProRounded.heavy },
	h3: { ...headingSizes['26px / 30px'], ...fonts.SFProRounded.bold },
	ts: { ...textSizes['12px / 14px'], ...fonts.SFProRounded.regular },
	tm: { ...textSizes['16px / 22px'], ...fonts.SFProRounded.regular },
	tl: { ...textSizes['20px / 24px'], ...fonts.SFProRounded.regular },
	title: { ...headingSizes['34px / 41px'], ...fonts.SFProRounded.bold },
	sfProRounded: { ...fonts.SFProRounded.medium },
})

ThemeManager.setComponentTheme('Text', {
	sfProRounded: true,
	tm: true,
})

ThemeManager.setComponentTheme('Incubator.Toast', {
	backgroundColor: Colors.blackTransparent8,
	messageStyle: { color: Colors.white },
	centerMessage: true,
})

ThemeManager.setComponentTheme('TextField', {
	autoCapitalize: 'none',
	tm: true,
})

Assets.loadAssetsGroup('illustrations', {
	graphicBackground: require('@assets/png/image-graphic-bg.png'),
	logo: require('@assets/png/logo.png'),
})

Assets.loadAssetsGroup('lottie', {
	robot404: require('@assets/lottie/animation-robot-404.json'),
})

export { colors, fonts, headingSizes, headingWeights, textSizes, textWeights, typeHierarchy }
