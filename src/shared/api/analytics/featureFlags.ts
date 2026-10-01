import { posthog } from './client'

/**
 * Registry of PostHog feature-flag keys. Workflow: create the flag in PostHog (Feature flags), add
 * its key here, then gate code with the hooks in `@app/shared/hooks/useFeatureFlag`. Call sites never use
 * raw strings, so a typo can't silently read as "off", and removing an entry surfaces every dead
 * call site at compile time. Experiments are multivariate flags: register the key and branch on
 * `useFeatureVariant`; exposure events are sent automatically (`sendFeatureFlagEvent`).
 */
export const FEATURE_FLAGS = {
	/** Home demo row: shows the flag's state and JSON payload. Safe to delete in a fork. */
	templateDemo: 'template-demo',
} as const

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS]

/**
 * Non-React read of the cached value, for stores and imperative flows. Prefer the hooks in
 * components: they re-render when flags reload.
 */
export function getFeatureFlag(flag: FeatureFlagKey) {
	return posthog.getFeatureFlag(flag)
}
