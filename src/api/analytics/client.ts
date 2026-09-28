import PostHog, { PostHogPersistedProperty } from 'posthog-react-native'
import { Platform } from 'react-native'
import { IS_DEV, POSTHOG_HOST, POSTHOG_PROJECT_TOKEN } from '@app/env'
import { analyticsStorage } from '@app/storage'

const REQUEST_TIMEOUT_MS = 10_000

// Expo Router's export evaluates the routes in Node (web platform, no DOM) for the server manifest and
// static render. There is no storage there: MMKV's web backend throws on first access. Same check as
// MMKV's own `canUseDOM`.
const IS_SERVER =
	Platform.OS === 'web' && (typeof window === 'undefined' || typeof window.document?.createElement !== 'function')

/**
 * False when no project token is set: the client is disabled, sends nothing and loads no flags.
 * Deliberately not tied to IS_SERVER, so a web server render and the browser show the same UI.
 */
export const isAnalyticsConfigured = !!POSTHOG_PROJECT_TOKEN

/** No PostHog project (the default for a fresh fork): in dev, print what would have been sent. */
export function logUnsentAnalytics(kind: 'event' | 'screen', name: string, properties?: object) {
	if (__DEV__) console.log(`[analytics] ${kind} ${name}`, properties ?? {})
}

/**
 * The app's PostHog client. Rendered through `PostHogProvider` in the root layout; outside React,
 * import it from here. The token is required by the constructor even when disabled.
 */
export const posthog = new PostHog(POSTHOG_PROJECT_TOKEN ?? 'phc_disabled', {
	host: POSTHOG_HOST,
	disabled: !isAnalyticsConfigured || IS_SERVER,
	persistence: IS_SERVER ? 'memory' : 'file',
	// PostHog keeps one JSON blob; MMKV is synchronous, so the persisted state is ready at startup.
	customStorage: {
		getItem: key => analyticsStorage.getString(key) ?? null,
		setItem: (key, value) => analyticsStorage.set(key, value),
	},
	captureAppLifecycleEvents: true,
	preloadFeatureFlags: true,
	sendFeatureFlagEvent: true,
	requestTimeout: REQUEST_TIMEOUT_MS,
	featureFlagsRequestTimeoutMs: REQUEST_TIMEOUT_MS,
})

if (isAnalyticsConfigured && !IS_SERVER) {
	// Logs until the provider mounts; PostHogProvider re-applies its `debug` prop (set to __DEV__ in the root layout).
	if (__DEV__) posthog.debug(true)
	// Super property on every event, so development traffic can be filtered out of insights.
	posthog.register({ environment: IS_DEV ? 'development' : 'production' }).catch(() => undefined)
}

/**
 * Identity reset for sign-out. An explicit keep-list replaces the SDK default
 * (install build/version, device id), so those are listed too; `OptedOut` is kept so a user who
 * turned analytics off stays opted out after signing out.
 */
export function resetAnalytics() {
	posthog.reset([
		PostHogPersistedProperty.OptedOut,
		PostHogPersistedProperty.InstalledAppBuild,
		PostHogPersistedProperty.InstalledAppVersion,
		PostHogPersistedProperty.DeviceId,
	])
}

/**
 * Keeps the analytics identity in step with auth events (call from the auth listener). Any event
 * with a user identifies it, including the cold-start `INITIAL_SESSION` (identify is a no-op for the
 * same id); only `SIGNED_OUT` resets, so a signed-out cold start doesn't mint a new anonymous id.
 */
export function syncAnalyticsUser(uid: string | null, event: string) {
	// The disabled client only warns on every call.
	if (!isAnalyticsConfigured) return
	if (uid) posthog.identify(uid)
	if (event === 'SIGNED_OUT') resetAnalytics()
}
