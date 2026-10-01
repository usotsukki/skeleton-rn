import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useAuthStore } from '@app/features/auth/hooks/useAuth'
import { useAndroidStableTabBar } from '@app/shared/hooks/useAndroidStableTabBar'
import { useTabScreenInsets } from '@app/shared/hooks/useTabScreenInsets'
import { AppText, Avatar, Card, KeyboardScrollView } from '@app/shared/ui'
import { LANDING_SCREEN_TEST_ID } from '@app/shared/utils/navigation'
// #region template:component-gallery
import { ComponentGallery } from './components/ComponentGallery'
// #endregion template:component-gallery
// #region template:feature-flag-demo
import { FeatureFlagDemo } from './components/FeatureFlagDemo'
// #endregion template:feature-flag-demo
// #region template:list-demo
import { ListDemoLink } from './components/ListDemoLink'

// #endregion template:list-demo

export default function Home() {
	const { t } = useTranslation()
	const { paddingTop, paddingBottom } = useTabScreenInsets()
	const user = useAuthStore(s => s.user)

	useAndroidStableTabBar()

	const displayName = user?.displayName ?? null
	const email = user?.email ?? null
	const heroLabel = displayName ?? email ?? t('homeScreen.defaultUser')
	const avatarLabel = displayName ?? email

	return (
		<View style={{ flex: 1 }} testID={LANDING_SCREEN_TEST_ID}>
			<KeyboardScrollView className="bg-bg-grouped" contentContainerStyle={{ paddingTop, paddingBottom }}>
				<View className="px-4 pt-2">
					<Card className="bg-bg-elevated">
						<View className="flex-row items-center gap-4 p-5">
							<Avatar name={avatarLabel} />
							<View className="flex-1">
								<AppText className="text-text" numberOfLines={1} variant="h3">
									{heroLabel}
								</AppText>
								{email ? (
									<AppText className="text-text-muted" numberOfLines={1} variant="cap">
										{email}
									</AppText>
								) : null}
							</View>
						</View>
					</Card>
				</View>

				{/* #region template:component-gallery */}
				<ComponentGallery />
				{/* #endregion template:component-gallery */}
				{/* #region template:list-demo */}
				<ListDemoLink />
				{/* #endregion template:list-demo */}
				{/* #region template:feature-flag-demo */}
				<FeatureFlagDemo />
				{/* #endregion template:feature-flag-demo */}
			</KeyboardScrollView>
		</View>
	)
}
