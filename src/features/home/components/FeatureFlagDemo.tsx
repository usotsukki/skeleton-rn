import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { FEATURE_FLAGS, isAnalyticsConfigured } from '@app/shared/api/analytics'
import { useFeatureGateState, useFeaturePayload } from '@app/shared/hooks/useFeatureFlag'
import { AppText, Card, SectionHeader } from '@app/shared/ui'

/** Live state of the `template-demo` PostHog flag: toggle it (or edit its payload) in PostHog and reopen the app. */
export function FeatureFlagDemo() {
	if (!isAnalyticsConfigured) return null
	return <FeatureFlagState />
}

function FeatureFlagState() {
	const { t } = useTranslation()
	const state = useFeatureGateState(FEATURE_FLAGS.templateDemo)
	const [, payload] = useFeaturePayload(FEATURE_FLAGS.templateDemo)
	return (
		<>
			<SectionHeader title={t('homeScreen.featureFlag')} />
			<View className="px-5">
				<Card>
					<View accessible className="gap-1 p-4" testID="feature-flag-demo">
						<AppText className="text-text" variant="tmed">
							{`${FEATURE_FLAGS.templateDemo}: ${t(`homeScreen.flagState.${state}`)}`}
						</AppText>
						{payload !== undefined ? (
							<AppText className="text-text-secondary" variant="ts">
								{JSON.stringify(payload)}
							</AppText>
						) : null}
					</View>
				</Card>
			</View>
		</>
	)
}
