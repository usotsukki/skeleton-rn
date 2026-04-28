import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { PortalHost } from '@rn-primitives/portal'
import * as Sentry from '@sentry/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isRunningInExpoGo, requireOptionalNativeModule } from 'expo'
import 'expo-dev-client'
import { Stack, useNavigationContainerRef } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { vars } from 'nativewind'
import { ErrorInfo, useCallback, useEffect } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { LogBox, Platform, useColorScheme as useDeviceScheme, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { enableScreens } from 'react-native-screens'
import { ErrorFallback, Toast } from '@app/components'
import { SkeletonPulseProvider } from '@app/components/shared/SkeletonPulseProvider'
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID, IS_PROD, SENTRY_DEBUG, SENTRY_DSN } from '@app/env'
import { useAuthListener, useAuthStore } from '@app/hooks/useAuth'
import { useAuthDeepLink } from '@app/hooks/useAuthDeepLink'
import useNetworkToast from '@app/hooks/useNetworkToast'
import { useStorageDevTools } from '@app/storage'
import { useThemeStore } from '@app/store/themeStore'
import { darkVars, lightVars } from '@app/theme/colors'
import '@app/theme/textShim'
import '@app/translations'
import '../../global.css'

if (__DEV__) {
	const DevMenuPreferences = requireOptionalNativeModule<{
		setPreferencesAsync: (prefs: Record<string, boolean>) => Promise<void>
	}>('DevMenuPreferences')
	DevMenuPreferences?.setPreferencesAsync({
		motionGestureEnabled: false,
		touchGestureEnabled: false,
		showFloatingActionButton: false,
	}).catch(() => {
		// Non-fatal
	})
}

SplashScreen.preventAutoHideAsync()

LogBox.ignoreLogs(['Invalid Refresh Token'])

GoogleSignin.configure({
	webClientId: GOOGLE_WEB_CLIENT_ID,
	iosClientId: GOOGLE_IOS_CLIENT_ID,
})

if (Platform.OS === 'android') {
	GoogleSignin.hasPlayServices().catch(error => {
		console.error('Google Play Services error', error)
	})
}

const navigationIntegration = Sentry.reactNavigationIntegration({
	enableTimeToInitialDisplay: !isRunningInExpoGo(),
	routeChangeTimeoutMs: 1000,
	ignoreEmptyBackNavigationTransactions: true,
})

Sentry.init({
	dsn: IS_PROD ? SENTRY_DSN : '',
	debug: SENTRY_DEBUG,
	enableLogs: false,
	tracesSampleRate: 0,
	integrations: [navigationIntegration],
})

enableScreens(true)

const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: 2 } },
})

const RootLayout = () => {
	const ref = useNavigationContainerRef()
	const themeMode = useThemeStore(s => s.mode)
	const deviceScheme = useDeviceScheme()
	const authHydrated = useAuthStore(s => s.hydrated)
	const resolvedScheme = themeMode === 'system' ? (deviceScheme ?? 'dark') : themeMode
	const themeVars = vars(resolvedScheme === 'dark' ? darkVars : lightVars)

	const onReset = useCallback(() => {
		if (ref.isReady()) {
			ref.navigate('/' as never)
		}
	}, [ref])

	const renderFallback = useCallback(
		({ error, resetErrorBoundary }: FallbackProps) => (
			<ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
		),
		[],
	)

	const onBoundaryError = useCallback((error: Error, info: ErrorInfo) => {
		Sentry.captureException(error, { extra: { componentStack: info.componentStack } })
	}, [])

	useEffect(() => {
		navigationIntegration.registerNavigationContainer(ref)
	}, [ref])

	useEffect(() => {
		const hide = () => SplashScreen.hideAsync().catch(() => {})
		if (authHydrated) {
			hide()
			return
		}
		const t = setTimeout(hide, 1500)
		return () => clearTimeout(t)
	}, [authHydrated])

	useAuthDeepLink()

	useNetworkToast()
	useAuthListener((_userData, event) => {
		if (event === 'SIGNED_OUT') {
			queryClient.clear()
		}
		if (event === 'SIGNED_IN') {
			queryClient.invalidateQueries()
		}
	})

	useStorageDevTools()

	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<KeyboardProvider navigationBarTranslucent statusBarTranslucent>
					<SafeAreaProvider>
						<StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
						<View className="flex-1 bg-bg" style={themeVars}>
							<SkeletonPulseProvider>
								<Toast />
								<BottomSheetModalProvider>
									<ErrorBoundary fallbackRender={renderFallback} onError={onBoundaryError} onReset={onReset}>
										<Stack
											screenOptions={{
												headerShown: false,
												animation: 'fade',
												animationDuration: 200,
											}}
										/>
									</ErrorBoundary>
								</BottomSheetModalProvider>
							</SkeletonPulseProvider>
							<PortalHost />
						</View>
					</SafeAreaProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	)
}

export default Sentry.wrap(RootLayout)
