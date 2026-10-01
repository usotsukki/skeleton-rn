import { evaluateConfig, pluginNamed, PRODUCTION_ENV } from '@app/test/appConfig'

describe('app.config Google Maps', () => {
	it('passes the keys to the react-native-maps plugin and the native config', () => {
		const config = evaluateConfig({ GOOGLE_MAPS_API_KEY_ANDROID: 'a-key', GOOGLE_MAPS_API_KEY_IOS: 'i-key' })
		expect(pluginNamed(config, 'react-native-maps')).toEqual([
			'react-native-maps',
			{ androidGoogleMapsApiKey: 'a-key', iosGoogleMapsApiKey: 'i-key' },
		])
		expect(config.android?.config?.googleMaps?.apiKey).toBe('a-key')
		expect(config.ios?.config?.googleMapsApiKey).toBe('i-key')
	})

	it('requires the Android key only for Android production builds', () => {
		const withoutKey: Record<string, string> = { ...PRODUCTION_ENV }
		delete withoutKey.GOOGLE_MAPS_API_KEY_ANDROID
		expect(() => evaluateConfig({ ...withoutKey, EAS_BUILD: 'true', EAS_BUILD_PLATFORM: 'ios' })).not.toThrow()
		expect(() => evaluateConfig({ ...withoutKey, EAS_BUILD: 'true', EAS_BUILD_PLATFORM: 'android' })).toThrow(
			/GOOGLE_MAPS_API_KEY_ANDROID/,
		)
	})
})
