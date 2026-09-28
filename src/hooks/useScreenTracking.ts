import { usePathname, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { posthog } from '@app/api/analytics'

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
		posthog.screen(screenName, { pathname }).catch(() => undefined)
	}, [pathname, screenName])
}
