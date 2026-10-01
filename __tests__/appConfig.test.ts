import { evaluate, evaluateConfig, pluginNamed, PRODUCTION_ENV } from '@app/test/appConfig'

describe('app.config', () => {
	it('names and ids builds by environment', () => {
		expect(evaluateConfig({}).name).toBe('Demo Development')
		const testing = evaluateConfig({ EXPO_PUBLIC_NODE_ENV: 'testing' })
		expect(testing.name).toBe('Demo Testing')
		expect(testing.ios?.bundleIdentifier).toBe('com.acme.demo.test')
		expect(testing.android?.package).toBe('com.acme.demo.test')
		const production = evaluateConfig(PRODUCTION_ENV)
		expect(production.name).toBe('Demo')
		expect(production.ios?.bundleIdentifier).toBe('com.acme.demo')
	})

	it('lets env override the app.json identity', () => {
		const config = evaluateConfig({ EXPO_PUBLIC_APP_NAME: 'Other', EXPO_PUBLIC_IOS_BUNDLE_ID: 'com.acme.other' })
		expect(config.name).toBe('Other Development')
		expect(config.ios?.bundleIdentifier).toBe('com.acme.other')
	})

	it('lists every missing production key', () => {
		expect(() => evaluateConfig({ EXPO_PUBLIC_NODE_ENV: 'production' })).toThrow(
			/EXPO_PUBLIC_EAS_PROJECT_ID[\s\S]*EXPO_PUBLIC_EAS_OWNER/,
		)
	})

	it('requires native-only keys just for native builds of that platform', () => {
		const withoutTeam: Record<string, string> = { ...PRODUCTION_ENV }
		delete withoutTeam.APPLE_TEAM_ID
		// JS-only (OTA update / export): native keys are not needed.
		expect(() => evaluateConfig(withoutTeam)).not.toThrow()
		// EAS Android build: the iOS team id is still not needed.
		expect(() => evaluateConfig({ ...withoutTeam, EAS_BUILD: 'true', EAS_BUILD_PLATFORM: 'android' })).not.toThrow()
		expect(() => evaluateConfig({ ...withoutTeam, EAS_BUILD: 'true', EAS_BUILD_PLATFORM: 'ios' })).toThrow(
			/APPLE_TEAM_ID/,
		)
	})

	it('derives the Google iOS URL scheme and rejects the reversed form', () => {
		const config = evaluateConfig({ EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: '123-abc.apps.googleusercontent.com' })
		expect(pluginNamed(config, '@react-native-google-signin/google-signin')).toEqual([
			'@react-native-google-signin/google-signin',
			{ iosUrlScheme: 'com.googleusercontent.apps.123-abc' },
		])
		expect(() => evaluateConfig({ EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: 'com.googleusercontent.apps.123-abc' })).toThrow(
			/not the reversed URL scheme/,
		)
	})

	it('skips the Google Sign-In plugin without an iOS client id', () => {
		expect(pluginNamed(evaluateConfig({}), '@react-native-google-signin/google-signin')).toBeUndefined()
	})

	it('points updates at the EAS project', () => {
		const config = evaluateConfig({ EXPO_PUBLIC_EAS_PROJECT_ID: 'abc' })
		expect(config.updates?.url).toBe('https://u.expo.dev/abc')
		expect(config.extra?.eas).toEqual({ projectId: 'abc' })
		expect(config.runtimeVersion).toEqual({ policy: 'appVersion' })
	})

	it('skips the Sentry upload without a token', () => {
		expect(evaluate({}).env.SENTRY_DISABLE_AUTO_UPLOAD).toBe('true')
		expect(evaluate({ SENTRY_AUTH_TOKEN: 'token' }).env.SENTRY_DISABLE_AUTO_UPLOAD).toBeUndefined()
	})
})
