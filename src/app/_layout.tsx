import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { PortalHost } from '@rn-primitives/portal'
import * as Sentry from '@sentry/react-native'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { isRunningInExpoGo, requireOptionalNativeModule } from 'expo'
import 'expo-dev-client'
import { Stack, useNavigationContainerRef } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { vars } from 'nativewind'
import { ErrorInfo, useCallback, useEffect, useState } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { LogBox, Platform, useColorScheme as useDeviceScheme, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { enableScreens } from 'react-native-screens'
import {
	bindQueryManagers,
	createAppQueryClient,
	createQueryCacheOwnership,
	createQueryPersistOptions,
	startSlowQueryWatchdog,
} from '@app/api/query'
import { AnimatedSplash, AppAlert, ErrorFallback, Toast } from '@app/components'
import { SkeletonPulseProvider } from '@app/components/shared/SkeletonPulseProvider'
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID, IS_PROD, SENTRY_DEBUG, SENTRY_DSN } from '@app/env'
import useAlert from '@app/hooks/useAlert'
import { useAuthListener, useAuthStore } from '@app/hooks/useAuth'
import { useAuthAutoRefresh } from '@app/hooks/useAuthAutoRefresh'
import { useAuthDeepLink } from '@app/hooks/useAuthDeepLink'
import useNetworkToast from '@app/hooks/useNetworkToast'
import useSplash from '@app/hooks/useSplash'
import { useSyncNativeAppearance } from '@app/hooks/useSyncNativeAppearance'
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

const SPLASH_MAX_WAIT_MS = 1500

const queryClient = createAppQueryClient()

const RootLayout = () => {
	const ref = useNavigationContainerRef()
	const themeMode = useThemeStore(s => s.mode)
	const deviceScheme = useDeviceScheme()
	const authHydrated = useAuthStore(s => s.hydrated)
	const [splashReady, setSplashReady] = useState(false)
	const splashFinished = useSplash(s => s.isSplashFinished)
	const alertVisible = useAlert(s => s.visible)
	const setSplashFinished = useSplash(s => s.setSplashFinished)
	const resolvedScheme = themeMode === 'system' ? (deviceScheme ?? 'dark') : themeMode
	const themeVars = vars(resolvedScheme === 'dark' ? darkVars : lightVars)
	// Fixed for the app's lifetime: the persisted cache belongs to whoever was signed in at launch.
	const [launchUid] = useState(() => useAuthStore.getState().user?.uid ?? null)
	const [persistOptions] = useState(() => createQueryPersistOptions(launchUid))
	const [cacheOwnership] = useState(() => createQueryCacheOwnership(queryClient, launchUid))

	const onQueryCacheRestored = useCallback(() => {
		cacheOwnership.onRestored(useAuthStore.getState().user?.uid ?? null)
	}, [cacheOwnership])

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

	useEffect(() => bindQueryManagers(), [])

	useEffect(() => startSlowQueryWatchdog(queryClient), [])

	// Auth hydration normally finishes first; the timeout keeps a stuck hydration from pinning the splash.
	useEffect(() => {
		if (authHydrated) {
			setSplashReady(true)
			return
		}
		const t = setTimeout(() => setSplashReady(true), SPLASH_MAX_WAIT_MS)
		return () => clearTimeout(t)
	}, [authHydrated])

	useAuthDeepLink()
	useAuthAutoRefresh()
	useSyncNativeAppearance()

	useNetworkToast()
	useAuthListener((userData, event) => {
		if (event === 'SIGNED_OUT') {
			cacheOwnership.onSignedOut()
		}
		if (event === 'SIGNED_IN') {
			if (userData) cacheOwnership.onSignedIn(userData.uid)
			queryClient.invalidateQueries()
		}
	})

	useStorageDevTools()

	return (
		<PersistQueryClientProvider client={queryClient} onSuccess={onQueryCacheRestored} persistOptions={persistOptions}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<KeyboardProvider>
					<SafeAreaProvider>
						<StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
						<View className="flex-1 bg-bg" style={themeVars}>
							{/* Keep screen readers off the app while the (opaque, touch-blocking) splash covers it. */}
							<View
								accessibilityElementsHidden={!splashFinished}
								className="flex-1"
								importantForAccessibility={splashFinished ? 'auto' : 'no-hide-descendants'}>
								{/* While an alert is open only it is reachable by screen readers (accessibilityViewIsModal
								    is iOS-only). The alert renders into PortalHost, outside this wrapper. */}
								<View
									accessibilityElementsHidden={alertVisible}
									className="flex-1"
									importantForAccessibility={alertVisible ? 'no-hide-descendants' : 'auto'}>
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
											{/* Inside the sheet provider so alerts can open over bottom sheets; renders into PortalHost. */}
											<AppAlert />
										</BottomSheetModalProvider>
									</SkeletonPulseProvider>
								</View>
								<PortalHost />
							</View>
							{!splashFinished && <AnimatedSplash onHidden={setSplashFinished} ready={splashReady} />}
						</View>
					</SafeAreaProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</PersistQueryClientProvider>
	)
}

export default Sentry.wrap(RootLayout)
