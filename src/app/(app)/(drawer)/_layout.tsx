import { Drawer } from 'expo-router/drawer'
import { DrawerContent } from '@app/components/drawer'

const DrawerLayout = () => {
	return (
		<Drawer
			drawerContent={DrawerContent}
			initialRouteName="(tabs)"
			screenOptions={{
				drawerType: 'front',
				headerShown: false,
				freezeOnBlur: true,
			}}>
			<Drawer.Screen name="(tabs)" />
			<Drawer.Screen name="Settings" />
		</Drawer>
	)
}

export default DrawerLayout
