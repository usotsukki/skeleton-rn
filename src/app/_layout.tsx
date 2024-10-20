import { GoogleSignin } from '@react-native-google-signin/google-signin'
import * as Sentry from '@sentry/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isRunningInExpoGo } from 'expo'
import { Slot, useNavigationContainerRef, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { enableScreens } from 'react-native-screens'
import { NetInfoToast, Toast } from '@app/components'
import { GOOGLE_WEB_CLIENT_ID, IS_PROD, SENTRY_DEBUG, SENTRY_DSN } from '@app/env'
import { useLoadFonts } from '@app/hooks'
import { useStorageDevTools } from '@app/storage'
import { useStore } from '@app/store'
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
	const segments = useSegments()
	const queryClient = new QueryClient()
	const user = useStore(state => state.auth.user)
	const authRequired = segments[0] === '(tabs)'

	useEffect(() => {
		if (fontsFinishedLoading) {
			SplashScreen.hideAsync()
			routingInstrumentation.registerNavigationContainer(ref)
			GoogleSignin.configure({
				webClientId: GOOGLE_WEB_CLIENT_ID,
			})
			GoogleSignin.hasPlayServices()
		}
	}, [fontsFinishedLoading])

	useEffect(() => {
		if (authRequired && !user) {
			router.replace('/(auth)/Welcome')
		}
		if (!authRequired && user) {
			router.replace('/(tabs)/Home')
		}
	}, [user, authRequired])

	useStorageDevTools()

	return (
		<QueryClientProvider client={queryClient}>
			<SafeAreaProvider>
				<NetInfoToast />
				<Toast />
				<Slot />
			</SafeAreaProvider>
		</QueryClientProvider>
	)
}

export default Sentry.wrap(RootLayout)
