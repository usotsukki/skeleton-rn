import { useSegments } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { DrawerContent } from '@app/components/drawer'
import { isPushedTabScreen } from '@app/utils/navigation'

const DrawerLayout = () => {
	const swipeEnabled = !isPushedTabScreen(useSegments())
	return (
		<Drawer
			drawerContent={DrawerContent}
			initialRouteName="(tabs)"
			screenOptions={{
				drawerType: 'front',
				headerShown: false,
				freezeOnBlur: true,
				// A pushed screen owns the edge swipe (iOS back); the drawer stays reachable via its button.
				swipeEnabled,
			}}>
			<Drawer.Screen name="(tabs)" />
			<Drawer.Screen name="Settings" />
		</Drawer>
	)
}

export default DrawerLayout
