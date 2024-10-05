import { Stack } from 'expo-router/stack'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useLoadFonts } from '@app/hooks'
import { useStorageDevTools } from '@app/storage'
import '@app/theme'
import '@app/translations'

const RootLayout = () => {
	const { fontsFinishedLoading } = useLoadFonts()

	useStorageDevTools()

	useEffect(() => {
		if (fontsFinishedLoading) {
			SplashScreen.hideAsync()
		}
	}, [fontsFinishedLoading])

	return (
		<SafeAreaProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" />
			</Stack>
		</SafeAreaProvider>
	)
}

export default RootLayout
