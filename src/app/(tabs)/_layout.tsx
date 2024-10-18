import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons'
import { Tabs, useRouter } from 'expo-router'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from 'react-native-ui-lib'
import { ErrorFallback } from '@app/components'
import { ios } from '@app/env'
import { iconSizes } from '@app/theme/designSystem'

const TabLayout = () => {
	const { t } = useTranslation()
	const safeAreaInsets = useSafeAreaInsets()
	const tabBarBottomPadding = ios ? safeAreaInsets.bottom : 30

	const router = useRouter()

	const onReset = () => router.replace('/(tabs)/Home')
	const renderFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
		<ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
	)

	return (
		<ErrorBoundary fallbackRender={renderFallback} onReset={onReset}>
			<Tabs
				sceneContainerStyle={{ backgroundColor: Colors.grayBlack }}
				detachInactiveScreens={false}
				screenOptions={{
					tabBarTestID: 'TabBar',
					headerShown: false,
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
					name="index"
					options={{
						href: null,
					}}
				/>
				<Tabs.Screen
					name="(home)"
					options={{
						title: t('home'),
						tabBarIcon: ({ color }) => (
							<FontAwesome5 testID="TabBar.Home" size={iconSizes.navigation} name="react" color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="(demo)"
					options={{
						title: t('demo'),
						tabBarIcon: ({ color }) => (
							<FontAwesome6 testID="TabBar.Demo" size={iconSizes.navigation} name="circle-notch" color={color} />
						),
					}}
				/>
			</Tabs>
		</ErrorBoundary>
	)
}

export default TabLayout
