import * as Sentry from '@sentry/react-native'
import { isRunningInExpoGo } from 'expo'
import { useNavigationContainerRef } from 'expo-router'
import { Stack } from 'expo-router/stack'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { IS_PROD, SENTRY_DEBUG, SENTRY_DSN } from '@app/env'
import { useLoadFonts } from '@app/hooks'
import { useStorageDevTools } from '@app/storage'
import '@app/theme'
import '@app/translations'

SplashScreen.preventAutoHideAsync()

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation({ enableTimeToInitialDisplay: true })

Sentry.init({
	dsn: IS_PROD ? SENTRY_DSN : '',
	debug: SENTRY_DEBUG,
	tracesSampleRate: 0.2,
	integrations: [
		new Sentry.ReactNativeTracing({
			routingInstrumentation,
			enableNativeFramesTracking: !isRunningInExpoGo(),
		}),
	],
})

const RootLayout = () => {
	const ref = useNavigationContainerRef()
	const { fontsFinishedLoading } = useLoadFonts()

	useEffect(() => {
		if (fontsFinishedLoading) {
			SplashScreen.hideAsync()
			routingInstrumentation.registerNavigationContainer(ref)
		}
	}, [fontsFinishedLoading])

	useStorageDevTools()

	return (
		<SafeAreaProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" />
			</Stack>
		</SafeAreaProvider>
	)
}

export default Sentry.wrap(RootLayout)
