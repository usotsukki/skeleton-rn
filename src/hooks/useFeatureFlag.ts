import { useFeatureFlag, useFeatureFlags, useFeatureFlagWithPayload } from 'posthog-react-native'
import { type FeatureFlagKey, isAnalyticsConfigured, posthog } from '@app/api/analytics'

export type FeatureGateState = 'loading' | 'on' | 'off'

/**
 * Boolean gate for rollouts and kill switches. `false` until flags load (and always without a
 * PostHog token), so gate NEW behavior behind it and keep the current experience as the fallback.
 */
export function useFeatureGate(flag: FeatureFlagKey): boolean {
	return !!useFeatureFlag(flag, posthog)
}

/**
 * `useFeatureGate` with the load state, for places where the fallback is itself visible, so first
 * paint before flags arrive doesn't flash the wrong thing. Without a token flags never load: 'off'.
 */
export function useFeatureGateState(flag: FeatureFlagKey): FeatureGateState {
	const flags = useFeatureFlags(posthog)
	const value = useFeatureFlag(flag, posthog)
	if (!isAnalyticsConfigured) return 'off'
	if (flags === undefined) return 'loading'
	return value ? 'on' : 'off'
}

/** Experiment variant; `undefined` while loading or when not enrolled: render the control for both. */
export function useFeatureVariant(flag: FeatureFlagKey): string | undefined {
	const value = useFeatureFlag(flag, posthog)
	return typeof value === 'string' ? value : undefined
}

/** Flag value plus its JSON payload: remote config (copy, limits, URLs) without an app release. */
export function useFeaturePayload(flag: FeatureFlagKey) {
	return useFeatureFlagWithPayload(flag, posthog)
}
