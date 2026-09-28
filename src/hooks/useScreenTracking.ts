import { usePathname, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { isAnalyticsConfigured, logUnsentAnalytics, posthog } from '@app/api/analytics'

/**
 * Sends a PostHog screen view per route change (the SDK's screen autocapture doesn't cover
 * expo-router). The screen name is the route pattern from segments, so dynamic ids don't explode
 * its cardinality; the concrete path rides along as a property.
 */
export function useScreenTracking() {
	const pathname = usePathname()
	const screenName = useSegments().join('/') || pathname
	useEffect(() => {
		if (!pathname) return
		if (!isAnalyticsConfigured) return logUnsentAnalytics('screen', screenName, { pathname })
		posthog.screen(screenName, { pathname }).catch(() => undefined)
	}, [pathname, screenName])
}
