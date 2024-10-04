import { Stack } from 'expo-router/stack'
import { Colors } from 'react-native-ui-lib'
import { fonts, headingSizes } from '@app/theme'

const screenOptions = {
	headerStyle: {
		backgroundColor: Colors.primary,
	},
	headerTitleStyle: [
		{
			color: Colors.black,
			...headingSizes['26px / 30px'],
			...fonts.SFProRounded.bold,
		},
	],
}

const Layout = () => {
	return (
		<Stack screenOptions={screenOptions}>
			<Stack.Screen name="index" options={{ title: 'Home' }} />
		</Stack>
	)
}
export default Layout
