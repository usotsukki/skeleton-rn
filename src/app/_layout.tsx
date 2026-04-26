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
import { LogBox, Platform, useColorScheme as useDeviceScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { enableScreens } from 'react-native-screens'
import { ErrorFallback, Toast } from '@app/components'
import { SkeletonPulseProvider } from '@app/components/shared/SkeletonPulseProvider'
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID, IS_PROD, SENTRY_DEBUG, SENTRY_DSN } from '@app/env'
import { useAuthListener } from '@app/hooks/useAuth'
import { useAuthDeepLink } from '@app/hooks/useAuthDeepLink'
import useNetworkToast from '@app/hooks/useNetworkToast'
import { useStorageDevTools } from '@app/storage'
import { useThemeStore } from '@app/store/themeStore'
import '@app/translations'
import '../../global.css'

// Dev-only: disable expo-dev-menu shake/touch gestures + floating action button.
// Prevents accidental dev-menu interception on deep links and during automation.
// No-op in release — module is null.
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
	enableNativeFramesTracking: !isRunningInExpoGo(),
	integrations: [navigationIntegration],
})

enableScreens(true)

const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: 2 } },
})

const LIGHT_VARS = {
	'--color-bg': '255 255 255',
	'--color-bg-elevated': '242 242 247',
	'--color-bg-grouped': '242 242 247',
	'--color-surface': '255 255 255',
	'--color-surface-strong': '255 255 255',
	'--color-text': '0 0 0',
	'--color-text-secondary': '60 60 67',
	'--color-text-muted': '142 142 147',
	'--color-text-on-accent': '255 255 255',
	'--color-border': '198 198 200',
	'--color-border-strong': '168 168 171',
	'--color-separator': '60 60 67',
	'--color-accent': '217 119 87',
	'--color-accent-pressed': '198 104 69',
	'--color-accent-soft': '217 119 87',
	'--color-danger': '255 59 48',
	'--color-danger-soft': '255 59 48',
	'--color-success': '52 199 89',
	'--color-warning': '255 149 0',
	'--color-skeleton': '229 229 234',
	'--color-scrim': '0 0 0',
	'--color-scrim-soft': '0 0 0',
}

const DARK_VARS = {
	'--color-bg': '31 30 29',
	'--color-bg-elevated': '43 42 40',
	'--color-bg-grouped': '25 24 26',
	'--color-surface': '255 255 255',
	'--color-surface-strong': '255 255 255',
	'--color-text': '237 237 236',
	'--color-text-secondary': '168 165 159',
	'--color-text-muted': '117 112 103',
	'--color-text-on-accent': '255 255 255',
	'--color-border': '58 56 53',
	'--color-border-strong': '77 74 69',
	'--color-separator': '255 255 255',
	'--color-accent': '217 119 87',
	'--color-accent-pressed': '198 104 69',
	'--color-accent-soft': '217 119 87',
	'--color-danger': '239 111 79',
	'--color-danger-soft': '239 111 79',
	'--color-success': '110 192 122',
	'--color-warning': '217 164 92',
	'--color-skeleton': '58 56 53',
	'--color-scrim': '0 0 0',
	'--color-scrim-soft': '0 0 0',
}

const RootLayout = () => {
	const ref = useNavigationContainerRef()
	const themeMode = useThemeStore(s => s.mode)
	const deviceScheme = useDeviceScheme()
	const resolvedScheme = themeMode === 'system' ? (deviceScheme ?? 'dark') : themeMode
	const themeVars = vars(resolvedScheme === 'dark' ? DARK_VARS : LIGHT_VARS)

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

	const onBoundaryError = useCallback((error: Error, info: ErrorInfo) => {
		Sentry.captureException(error, { extra: { componentStack: info.componentStack } })
	}, [])

	useEffect(() => {
		navigationIntegration.registerNavigationContainer(ref)
		SplashScreen.hideAsync()
	}, [])

	// Wires Supabase email-link / recovery URLs into auth state.
	useAuthDeepLink()

	// Surfaces an offline toast when network drops.
	useNetworkToast()

	// Subscribes to Supabase auth changes; populates the auth store.
	// Navigation between (auth) and (app) groups is handled by their layout guards
	// reacting to the store update — no imperative routing here.
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
		<GestureHandlerRootView className="flex-1 bg-bg" style={themeVars}>
			<StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
			<SkeletonPulseProvider>
				<QueryClientProvider client={queryClient}>
					<SafeAreaProvider>
						<Toast />
						<KeyboardProvider>
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
						</KeyboardProvider>
					</SafeAreaProvider>
				</QueryClientProvider>
			</SkeletonPulseProvider>
			<PortalHost />
		</GestureHandlerRootView>
	)
}

export default Sentry.wrap(RootLayout)
