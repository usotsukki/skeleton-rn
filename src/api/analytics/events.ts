import { isAnalyticsConfigured, logUnsentAnalytics, posthog } from './client'

export type SignInMethod = 'email' | 'google' | 'apple'

/**
 * Every product event and its properties. Call sites go through `trackEvent`, never raw strings,
 * so a typo can't create a new event and renaming one surfaces every call site.
 */
interface AnalyticsEvents {
	signed_in: { method: SignInMethod }
	/**
	 * Accepted email sign-up request. Not "account created": with email confirmation on, Supabase
	 * answers an existing address the same way (so sign-up doesn't reveal accounts).
	 */
	sign_up_submitted: Record<string, never>
}

export type AnalyticsEvent = keyof AnalyticsEvents

export function trackEvent<E extends AnalyticsEvent>(
	...[event, properties]: AnalyticsEvents[E] extends Record<string, never>
		? [event: E]
		: [event: E, properties: AnalyticsEvents[E]]
) {
	if (!isAnalyticsConfigured) return logUnsentAnalytics('event', event, properties)
	posthog.capture(event, properties)
}
