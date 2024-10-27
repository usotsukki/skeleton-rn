import { GoogleSignin } from '@react-native-google-signin/google-signin'
import * as Sentry from '@sentry/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isRunningInExpoGo } from 'expo'
import { Stack, useNavigationContainerRef, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useCallback, useEffect } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { enableScreens } from 'react-native-screens'
import { ErrorFallback, NetInfoToast, Toast } from '@app/components'
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

enableScreens(true)

const RootLayout = () => {
	const ref = useNavigationContainerRef()
	const { fontsFinishedLoading } = useLoadFonts()
	const router = useRouter()
	const segments = useSegments()
	const queryClient = new QueryClient()
	const user = useStore(state => state.auth.user)
	const authRequired = segments[0] === '(tabs)'

	const onReset = () => router.replace('/')

	const renderFallback = useCallback(
		({ error, resetErrorBoundary }: FallbackProps) => (
			<ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
		),
		[],
	)

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
			router.replace('/')
		}
		if (!authRequired && user) {
			router.replace('/(tabs)/(home)/Home')
		}
	}, [user, authRequired])

	useStorageDevTools()

	return (
		<QueryClientProvider client={queryClient}>
			<SafeAreaProvider>
				<ErrorBoundary fallbackRender={renderFallback} onReset={onReset}>
					<NetInfoToast />
					<Toast />
					<Stack
						screenOptions={{
							headerShown: false,
							animation: 'fade',
						}}
					/>
				</ErrorBoundary>
			</SafeAreaProvider>
		</QueryClientProvider>
	)
}

export default Sentry.wrap(RootLayout)
