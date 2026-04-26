import { DrawerActions } from '@react-navigation/native'
import { Tabs, useNavigation } from 'expo-router'
import { Home as HomeIcon, Map as MapIcon, Menu, Sparkles } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useThemeColors } from '@app/theme/colors'

const TabsLayout = () => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const navigation = useNavigation()
	const colors = useThemeColors()

	const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer())

	return (
		<Tabs
			initialRouteName="Home"
			screenOptions={{
				headerShown: true,
				headerShadowVisible: false,
				headerStyle: { backgroundColor: colors['bg'] },
				headerTitleStyle: { color: colors['text'], fontWeight: '600' },
				headerLeft: () => (
					<Pressable
						accessibilityLabel={t('a11y.openMenu')}
						accessibilityRole="button"
						className="ml-4"
						hitSlop={8}
						onPress={openDrawer}
						testID="HeaderDrawerMenu">
						<Menu color={colors['text']} size={22} />
					</Pressable>
				),
				tabBarActiveTintColor: colors['accent'],
				tabBarInactiveTintColor: colors['text-muted'],
				tabBarStyle: {
					backgroundColor: colors['bg'],
					borderTopColor: colors['separator'],
					height: 49 + insets.bottom,
					paddingBottom: insets.bottom,
				},
			}}>
			<Tabs.Screen
				name="Home"
				options={{
					title: t('home'),
					tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
				}}
			/>
			<Tabs.Screen
				name="Map"
				options={{
					title: t('map'),
					tabBarIcon: ({ color, size }) => <MapIcon color={color} size={size} />,
				}}
			/>
			<Tabs.Screen
				name="Skia"
				options={{
					title: t('skia'),
					tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
				}}
			/>
		</Tabs>
	)
}

export default TabsLayout
