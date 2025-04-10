import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons'
import { Tabs, useRouter } from 'expo-router'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from 'react-native-ui-lib'
import { ErrorFallback } from '@app/components'
import { ios } from '@app/env'
import { useNotifications } from '@app/hooks'
import { iconSizes } from '@app/theme/designSystem'

const TabLayout = () => {
	const { t } = useTranslation()
	const safeAreaInsets = useSafeAreaInsets()
	const tabBarBottomPadding = ios ? safeAreaInsets.bottom : 30

	const router = useRouter()

	const onReset = () => router.replace('/(tabs)/(home)/Home')
	const renderFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
		<ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
	)

	useNotifications()

	return (
		<ErrorBoundary fallbackRender={renderFallback} onReset={onReset}>
			<Tabs
				detachInactiveScreens={false}
				screenOptions={{
					headerShown: false,
					freezeOnBlur: true,
					sceneStyle: { backgroundColor: Colors.grayBlack },
					tabBarVisibilityAnimationConfig: {
						show: { animation: 'timing', config: { duration: 500 } },
						hide: { animation: 'timing', config: { duration: 500 } },
					},
					tabBarActiveTintColor: Colors.primary,
					tabBarStyle: {
						backgroundColor: Colors.grayBlack,
						borderTopColor: Colors.primary,
						height: 60 + tabBarBottomPadding,
						paddingBottom: tabBarBottomPadding,
						paddingTop: 15,
					},
				}}>
				<Tabs.Screen
					name="(home)"
					options={{
						title: t('home'),
						tabBarIcon: ({ color }) => (
							<FontAwesome5 color={color} name="react" size={iconSizes.navigation} testID="TabBar.Home" />
						),
					}}
				/>
				<Tabs.Screen
					name="(demo)"
					options={{
						title: t('demo'),
						tabBarIcon: ({ color }) => (
							<FontAwesome6 color={color} name="circle-notch" size={iconSizes.navigation} testID="TabBar.Demo" />
						),
					}}
				/>
			</Tabs>
		</ErrorBoundary>
	)
}

export default TabLayout
