import { useState } from 'react'
import { posthog } from '@app/api/analytics'

/**
 * The Settings analytics switch. Analytics are on by default; PostHog persists an opt-out (and
 * `resetAnalytics` keeps it across sign-out). Opting out stops events only: feature flags still load.
 */
export function useAnalyticsOptOut() {
	const [enabled, setEnabledState] = useState(() => !posthog.optedOut)

	const setEnabled = (next: boolean) => {
		setEnabledState(next)
		;(next ? posthog.optIn() : posthog.optOut()).catch(() => undefined)
	}

	return { enabled, setEnabled }
}
