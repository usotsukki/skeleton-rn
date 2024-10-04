import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from 'react-native-ui-lib'
import { ios } from '@app/env'

const TabLayout = () => {
	const safeAreaInsets = useSafeAreaInsets()
	const tabBarBottomPadding = ios ? safeAreaInsets.bottom : 30

	return (
		<Tabs
			screenOptions={{
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
					tabBarButton: () => null,
				}}
			/>
			<Tabs.Screen
				name="Home"
				options={{
					title: 'Home',
					tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="react" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="Demo"
				options={{
					title: 'Demo',
					tabBarIcon: ({ color }) => <FontAwesome6 size={28} name="circle-notch" color={color} />,
				}}
			/>
		</Tabs>
	)
}

export default TabLayout
