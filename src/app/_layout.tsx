import { GoogleSignin } from '@react-native-google-signin/google-signin'
import * as Sentry from '@sentry/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isRunningInExpoGo } from 'expo'
import { Stack, useNavigationContainerRef, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useCallback, useEffect, useState } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { enableScreens } from 'react-native-screens'
import { ErrorFallback, NetInfoToast, Toast } from '@app/components'
import { GOOGLE_WEB_CLIENT_ID, IS_PROD, SENTRY_DEBUG, SENTRY_DSN } from '@app/env'
import { useLoadFonts } from '@app/hooks'
import { useAuthListener, useAuthStore } from '@app/hooks/useAuth'
import { useStorageDevTools } from '@app/storage'
import '@app/theme'
import '@app/translations'

SplashScreen.preventAutoHideAsync()

GoogleSignin.configure({
	webClientId: GOOGLE_WEB_CLIENT_ID,
})
GoogleSignin.hasPlayServices()

const navigationIntegration = Sentry.reactNavigationIntegration({
	enableTimeToInitialDisplay: !isRunningInExpoGo(),
	routeChangeTimeoutMs: 1000,
	ignoreEmptyBackNavigationTransactions: true,
})

Sentry.init({
	dsn: IS_PROD ? SENTRY_DSN : '',
	debug: SENTRY_DEBUG,
	tracesSampleRate: 1.0,
	enableNativeFramesTracking: !isRunningInExpoGo(),
	integrations: [navigationIntegration],
})

enableScreens(true)

const RootLayout = () => {
	const ref = useNavigationContainerRef()
	const { fontsFinishedLoading } = useLoadFonts()
	const router = useRouter()
	const segments = useSegments()
	const queryClient = new QueryClient()
	const { user } = useAuthStore()
	const authRequired = segments[0] === '(tabs)'

	const [hasInitialized, setHasInitialized] = useState(false)

	const onReset = () => {
		if (ref.isReady()) {
			ref.navigate('/' as never)
		}
	}

	const renderFallback = useCallback(
		({ error, resetErrorBoundary }: FallbackProps) => (
			<ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
		),
		[],
	)

	useEffect(() => {
		if (fontsFinishedLoading) {
			navigationIntegration.registerNavigationContainer(ref)
			SplashScreen.hideAsync()
			setHasInitialized(true)
		}
	}, [fontsFinishedLoading])

	useEffect(() => {
		if (!hasInitialized) return
		if (authRequired && !user) {
			router.replace('/')
		}
		if (!authRequired && user) {
			router.replace('/(tabs)/(home)/Home')
		}
	}, [user, authRequired, hasInitialized])

	useAuthListener()

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
							animationDuration: 200,
						}}
					/>
				</ErrorBoundary>
			</SafeAreaProvider>
		</QueryClientProvider>
	)
}

export default Sentry.wrap(RootLayout)
