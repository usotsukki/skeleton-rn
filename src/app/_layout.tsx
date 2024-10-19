import auth from '@react-native-firebase/auth'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import * as Sentry from '@sentry/react-native'
import { isRunningInExpoGo } from 'expo'
import { Slot, useNavigationContainerRef, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { enableScreens } from 'react-native-screens'
import { NetInfoToast, Toast } from '@app/components'
import { GOOGLE_WEB_CLIENT_ID, IS_PROD, SENTRY_DEBUG, SENTRY_DSN } from '@app/env'
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

enableScreens(false)

const RootLayout = () => {
	const ref = useNavigationContainerRef()
	const { fontsFinishedLoading } = useLoadFonts()
	const router = useRouter()

	useEffect(() => {
		if (fontsFinishedLoading) {
			const unsubscribe = auth().onAuthStateChanged(user =>
				// setTimeout used to ensure that all synchronous state updates and rendering are executed first
				setTimeout(() => {
					router.replace(user ? '/(tabs)/Home' : '/(auth)/Welcome')
				}),
			)

			SplashScreen.hideAsync()
			routingInstrumentation.registerNavigationContainer(ref)
			GoogleSignin.configure({
				webClientId: GOOGLE_WEB_CLIENT_ID,
			})
			GoogleSignin.hasPlayServices()

			return unsubscribe
		}
	}, [fontsFinishedLoading])

	useStorageDevTools()

	return (
		<SafeAreaProvider>
			<NetInfoToast />
			<Toast />
			<Slot />
		</SafeAreaProvider>
	)
}

export default Sentry.wrap(RootLayout)
