const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]'])

/** True when the URL points at this machine (the local Supabase stack). Same list as scripts/e2e-sign-in.sh. */
export function isLoopbackUrl(url: string | undefined): boolean {
	if (!url) return false
	try {
		return LOOPBACK_HOSTS.has(new URL(url).hostname)
	} catch {
		return false
	}
}

const ANDROID_EMULATOR_HOST = '10.0.2.2'

/** Loopback URL → the same URL on the Android emulator's alias for the host machine. Other URLs pass through. */
export function toAndroidEmulatorHostUrl(url: string | undefined): string | undefined {
	if (!url || !isLoopbackUrl(url)) return url
	const next = new URL(url)
	next.hostname = ANDROID_EMULATOR_HOST
	return next.toString().replace(/\/$/, '')
}
