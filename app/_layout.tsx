import { Stack } from 'expo-router/stack'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useLoadFonts } from '@app/hooks'
import '@app/theme'
import { logger } from '@app/utils'

const RootLayout = () => {
	const { fontsReady, error: errorLoadingFonts } = useLoadFonts()

	useEffect(() => {
		if (fontsReady) {
			SplashScreen.hideAsync()
		}
		if (errorLoadingFonts) {
			logger.error(errorLoadingFonts)
			SplashScreen.hideAsync()
		}
	}, [fontsReady, errorLoadingFonts])

	return (
		<SafeAreaProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" />
			</Stack>
		</SafeAreaProvider>
	)
}

export default RootLayout
