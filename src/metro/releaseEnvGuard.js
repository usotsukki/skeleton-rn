// Bundler-only. `.env.local` (written by `yarn backend:start`) outranks `.env` in every Expo mode except
// `test`, so a local release build would ship a localhost Supabase URL. Fail the production bundle instead.
const LOCAL_HOST = /^(127\.0\.0\.1|localhost|\[::1\]|10\.0\.2\.2)$/
const PRIVATE_HOST = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/

function isLocalOrPrivateUrl(url) {
	if (!url) return false
	try {
		const { hostname } = new URL(url)
		return LOCAL_HOST.test(hostname) || PRIVATE_HOST.test(hostname)
	} catch {
		return false
	}
}

/** Throws when a production bundle would talk to a backend on this machine or network. */
function assertReleaseBackend(env) {
	if (env.NODE_ENV !== 'production') return
	if (env.ALLOW_LOCAL_BACKEND_IN_RELEASE === 'true') return
	if (!isLocalOrPrivateUrl(env.EXPO_PUBLIC_SUPABASE_URL)) return
	throw new Error(
		'EXPO_PUBLIC_SUPABASE_URL points at a local backend in a production bundle. ' +
			'Run `yarn backend:stop` (removes the .env.local override) and build again, ' +
			'or set ALLOW_LOCAL_BACKEND_IN_RELEASE=true to test a release build against the local stack.',
	)
}

module.exports = { assertReleaseBackend, isLocalOrPrivateUrl }
