import appJson from '../../../app.json'
import { SPLASH_BACKGROUND, SPLASH_ICON_SIZE } from '../brand'

// The animated splash redraws the native one pixel-for-pixel, so both must read the same values.
describe('brand splash config', () => {
	type SplashPlugin = [string, { backgroundColor: string; imageWidth: number }]
	const splashPlugin = (appJson.expo.plugins as unknown[]).find(
		(p): p is SplashPlugin => Array.isArray(p) && p[0] === 'expo-splash-screen',
	)

	it('matches app.json expo-splash-screen background and icon width', () => {
		expect(splashPlugin?.[1].backgroundColor.toLowerCase()).toBe(SPLASH_BACKGROUND.toLowerCase())
		expect(splashPlugin?.[1].imageWidth).toBe(SPLASH_ICON_SIZE)
	})
})
