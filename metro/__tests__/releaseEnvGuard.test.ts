import { assertReleaseBackend } from '../releaseEnvGuard'

const LOCAL = 'http://127.0.0.1:54321'

describe('assertReleaseBackend', () => {
	it.each([LOCAL, 'http://localhost:54321', 'http://10.0.2.2:54321', 'http://192.168.1.20:54321'])(
		'fails a production bundle for %s',
		url => {
			expect(() => assertReleaseBackend({ NODE_ENV: 'production', EXPO_PUBLIC_SUPABASE_URL: url })).toThrow(
				'yarn backend:stop',
			)
		},
	)

	it('allows a hosted project in production', () => {
		expect(() =>
			assertReleaseBackend({ NODE_ENV: 'production', EXPO_PUBLIC_SUPABASE_URL: 'https://abc.supabase.co' }),
		).not.toThrow()
	})

	it('allows production without a Supabase URL', () => {
		expect(() => assertReleaseBackend({ NODE_ENV: 'production' })).not.toThrow()
	})

	it('allows the local backend in development', () => {
		expect(() => assertReleaseBackend({ NODE_ENV: 'development', EXPO_PUBLIC_SUPABASE_URL: LOCAL })).not.toThrow()
	})

	it('allows the local backend in production with the explicit opt-in', () => {
		expect(() =>
			assertReleaseBackend({
				NODE_ENV: 'production',
				EXPO_PUBLIC_SUPABASE_URL: LOCAL,
				ALLOW_LOCAL_BACKEND_IN_RELEASE: 'true',
			}),
		).not.toThrow()
	})
})
