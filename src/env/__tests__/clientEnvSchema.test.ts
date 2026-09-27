import { Platform } from 'react-native'
import { clientEnvSchema } from '../clientEnvSchema'

const productionEnv = {
	EXPO_PUBLIC_NODE_ENV: 'production',
	EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: 'web',
	EXPO_PUBLIC_EAS_PROJECT_ID: 'project',
	EXPO_PUBLIC_EAS_OWNER: 'owner',
	EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
	EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'key',
}

const withPlatform = (os: typeof Platform.OS, fn: () => void) => {
	const original = Platform.OS
	Object.defineProperty(Platform, 'OS', { value: os, configurable: true })
	try {
		fn()
	} finally {
		Object.defineProperty(Platform, 'OS', { value: original, configurable: true })
	}
}

describe('clientEnvSchema', () => {
	it('accepts minimal testing env', () => {
		const r = clientEnvSchema.safeParse({
			EXPO_PUBLIC_NODE_ENV: 'testing',
		})
		expect(r.success).toBe(true)
	})

	it('rejects invalid URL when EXPO_PUBLIC_SUPABASE_URL is set', () => {
		const r = clientEnvSchema.safeParse({
			EXPO_PUBLIC_NODE_ENV: 'development',
			EXPO_PUBLIC_SUPABASE_URL: 'not-a-url',
		})
		expect(r.success).toBe(false)
	})

	it('requires the Google iOS client id in production on iOS only', () => {
		withPlatform('ios', () => {
			const r = clientEnvSchema.safeParse(productionEnv)
			expect(r.success).toBe(false)
			expect(r.error?.issues.map(i => i.path[0])).toEqual(['EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'])
		})
		withPlatform('android', () => {
			expect(clientEnvSchema.safeParse(productionEnv).success).toBe(true)
		})
	})
})
