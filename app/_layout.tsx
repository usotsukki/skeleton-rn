import * as Sentry from '@sentry/react-native'
import { isRunningInExpoGo } from 'expo'
import { Stack } from 'expo-router/stack'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SENTRY_DEBUG, SENTRY_DSN } from '@app/env'
import { useLoadFonts } from '@app/hooks'
import { useStorageDevTools } from '@app/storage'
import '@app/theme'
import '@app/translations'

SplashScreen.preventAutoHideAsync()

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation()

Sentry.init({
	dsn: SENTRY_DSN,
	debug: SENTRY_DEBUG,
	tracesSampleRate: 1.0,
	integrations: [
		new Sentry.ReactNativeTracing({
			routingInstrumentation,
			enableNativeFramesTracking: !isRunningInExpoGo(),
		}),
	],
})

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

export default Sentry.wrap(RootLayout)
