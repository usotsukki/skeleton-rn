import { clientEnvSchema } from '../clientEnvSchema'

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
})
