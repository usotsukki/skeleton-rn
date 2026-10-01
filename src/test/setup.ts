/**
 * Global Jest mocks applied to every test via setupFilesAfterEach.
 * Add reusable mocks here rather than duplicating in individual test files.
 *
 * Note: jest.mock factories must not reference out-of-scope variables. Imports
 * (incl. React) and JSX get hoisted by Babel/NativeWind transforms and trip
 * the validation. Factories below stay JSX-free — return `children` directly.
 */

// No notifyManager act() wrapper: with RNTL 14, render/findBy*/waitFor already run inside act, and a
// wrapper fires late notifications outside the act environment ("not configured to support act").
const { focusManager, onlineManager } = require('@tanstack/react-query')
const { destroyTestQueryClients } = require('./queryClient')

jest.mock('react-native-mmkv', () => {
	const stores = new Map<string, Map<string, string>>()

	function getStore(id: string) {
		let store = stores.get(id)
		if (!store) {
			store = new Map<string, string>()
			stores.set(id, store)
		}
		return store
	}

	return {
		createMMKV: jest.fn(({ id }: { id: string }) => {
			const store = getStore(id)
			return {
				get size() {
					return Array.from(store.values()).reduce((sum, value) => sum + value.length, 0)
				},
				set: jest.fn((key: string, value: string) => store.set(key, value)),
				getString: jest.fn((key: string) => store.get(key)),
				remove: jest.fn((key: string) => store.delete(key)),
				clearAll: jest.fn(() => store.clear()),
				getAllKeys: jest.fn(() => Array.from(store.keys())),
				trim: jest.fn(),
				recrypt: jest.fn(),
			}
		}),
		existsMMKV: jest.fn((id: string) => (stores.get(id)?.size ?? 0) > 0),
		deleteMMKV: jest.fn((id: string) => stores.delete(id)),
		/** Test-only: empties every MMKV instance (called afterEach below). */
		__clearAllStores: () => stores.forEach(store => store.clear()),
	}
})

// Resets every zustand store after each test; see __mocks__/zustand.ts.
jest.mock('zustand')

// FlashList 2 renders rows only after measuring its container, which Jest can't do. Same values as
// the package's jestSetup.js, whose other mock (FlashList → RecyclerView) is broken in 2.0.2.
jest.mock('@shopify/flash-list/dist/recyclerview/utils/measureLayout', () => {
	const size = (width: number, height: number) => jest.fn(() => ({ x: 0, y: 0, width, height }))
	return {
		...jest.requireActual('@shopify/flash-list/dist/recyclerview/utils/measureLayout'),
		measureParentSize: size(400, 900),
		measureFirstChildLayout: size(400, 900),
		measureItemLayout: size(100, 100),
	}
})

// RN's StatusBar keeps a static setImmediate handle (StatusBar.js `_updateImmediate`). One created
// under fake timers and cleared with the real clearImmediate at unmount blocks the event loop, so
// RNTL's cleanup never returns. Tests don't assert on the status bar; render nothing.
jest.mock('expo-status-bar', () => ({
	StatusBar: () => null,
	setStatusBarStyle: jest.fn(),
	setStatusBarHidden: jest.fn(),
	setStatusBarBackgroundColor: jest.fn(),
}))

jest.mock('expo-router', () => {
	const passthrough = ({ children }: { children: unknown }) => children
	return {
		useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
		useLocalSearchParams: () => ({}),
		usePathname: () => '/',
		useSegments: () => [],
		Redirect: () => null,
		Stack: passthrough,
		Tabs: passthrough,
	}
})

jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
	initReactI18next: { type: '3rdParty', init: jest.fn() },
}))

jest.mock('i18next', () => ({
	t: (key: string) => key,
	use: jest.fn().mockReturnThis(),
	init: jest.fn(),
	on: jest.fn(),
}))

jest.mock('react-native-keyboard-controller', () => ({
	KeyboardAvoidingView: (p: { children: unknown }) => p.children,
	KeyboardAwareScrollView: (p: { children: unknown }) => p.children,
	KeyboardProvider: (p: { children: unknown }) => p.children,
}))

jest.mock('react-native-safe-area-context', () => {
	const passthrough = (p: { children: unknown }) => p.children
	return {
		useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
		SafeAreaProvider: passthrough,
		SafeAreaView: passthrough,
	}
})

jest.mock('@gorhom/bottom-sheet', () => {
	const passthrough = (p: { children?: unknown }) => p.children
	const SCROLLABLE_TYPE = { SCROLLVIEW: 'scrollview', FLATLIST: 'flatlist', VIEW: 'view' }
	return {
		__esModule: true,
		default: passthrough,
		BottomSheet: passthrough,
		BottomSheetModal: passthrough,
		BottomSheetModalProvider: passthrough,
		BottomSheetView: passthrough,
		BottomSheetScrollView: passthrough,
		BottomSheetFlatList: passthrough,
		BottomSheetBackdrop: passthrough,
		BottomSheetTextInput: passthrough,
		BottomSheetFooter: passthrough,
		SCROLLABLE_TYPE,
		createBottomSheetScrollableComponent: () => passthrough,
		useBottomSheet: () => ({ collapse: jest.fn(), expand: jest.fn(), close: jest.fn() }),
		useBottomSheetModal: () => ({ dismiss: jest.fn(), dismissAll: jest.fn() }),
	}
})

jest.mock('react-native-worklets', () => ({
	scheduleOnRN: (fn: (...args: unknown[]) => void, ...args: unknown[]) => fn(...args),
	scheduleOnUI: (fn: (...args: unknown[]) => void, ...args: unknown[]) => fn(...args),
	createSerializable: (value: unknown) => value,
	makeShareableCloneRecursive: (value: unknown) => value,
	executeOnUIRuntimeSync: (fn: (...args: unknown[]) => unknown) => fn,
	runOnJS: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
	runOnUI: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
	Worklets: {
		createRunOnJS: (fn: () => void) => fn,
		defaultContext: { runAsync: jest.fn() },
	},
}))

jest.mock('react-native-reanimated', () => {
	const passthrough = (Component: unknown) => Component
	const identity = <T>(v: T) => v
	const sharedRef = { value: 0 }
	const View = (p: { children?: unknown }) => p.children
	return {
		__esModule: true,
		default: {
			View,
			Text: View,
			ScrollView: View,
			FlatList: View,
			Image: View,
			createAnimatedComponent: passthrough,
		},
		View,
		createAnimatedComponent: passthrough,
		useSharedValue: () => ({ ...sharedRef }),
		useAnimatedStyle: (cb: () => unknown) => cb(),
		useAnimatedScrollHandler: () => jest.fn(),
		useAnimatedReaction: jest.fn(),
		useReducedMotion: () => false,
		useDerivedValue: (cb: () => unknown) => ({ value: cb() }),
		withTiming: identity,
		withSpring: identity,
		withRepeat: identity,
		withSequence: <T>(...vals: T[]) => vals[vals.length - 1],
		withDelay: <T>(_d: number, v: T) => v,
		cancelAnimation: jest.fn(),
		runOnJS: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
		runOnUI: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
		interpolate: (_v: number, _i: number[], o: number[]) => o[0],
		interpolateColor: (_v: number, _i: number[], o: string[]) => o[0],
		Easing: {
			linear: identity,
			ease: identity,
			cubic: identity,
			out: () => identity,
			inOut: () => identity,
			elastic: () => identity,
		},
		Extrapolation: { CLAMP: 'clamp' },
		LinearTransition: { duration: () => ({}) },
		FadeIn: { duration: () => ({}) },
		FadeOut: { duration: () => ({}) },
		SlideInUp: { duration: () => ({}) },
		SlideOutUp: { duration: () => ({}) },
		Layout: { springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) },
	}
})

// Stub TanStack Form devtools event client to prevent setInterval reconnect loop leaks.
jest.mock('@tanstack/devtools-event-client', () => ({
	EventClient: class {
		emit() {}
		on() {
			return () => {}
		}
	},
}))

jest.mock('expo-haptics', () => ({
	impactAsync: jest.fn().mockResolvedValue(undefined),
	notificationAsync: jest.fn().mockResolvedValue(undefined),
	selectionAsync: jest.fn().mockResolvedValue(undefined),
	ImpactFeedbackStyle: { Light: 0, Medium: 1, Heavy: 2, Soft: 3 },
	NotificationFeedbackType: { Success: 0, Warning: 1, Error: 2 },
}))

jest.mock('expo-checkbox', () => {
	function MockCheckbox(_props: { value?: boolean; onValueChange?: (v: boolean) => void; testID?: string }) {
		return null
	}
	return { __esModule: true, default: MockCheckbox }
})

jest.mock('expo-image', () => {
	function MockImage(_props: unknown) {
		return null
	}
	return { __esModule: true, Image: MockImage, default: MockImage }
})

jest.mock('expo-linking', () => ({
	openURL: jest.fn().mockResolvedValue(undefined),
	createURL: jest.fn(() => 'app://ResetPassword'),
	getInitialURL: jest.fn(() => Promise.resolve(null)),
	addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}))

jest.mock('expo-crypto', () => ({
	CryptoDigestAlgorithm: { SHA256: 'SHA256' },
	digestStringAsync: jest.fn().mockResolvedValue('hashed'),
	getRandomValues: jest.fn((bytes: Uint8Array) => bytes),
	randomUUID: jest.fn(() => 'mock-uuid'),
}))

// Keychain / Keystore as an in-memory map (auth storage keeps its encryption key here).
jest.mock('expo-secure-store', () => {
	const items = new Map<string, string>()
	return {
		AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
		getItem: jest.fn((key: string) => items.get(key) ?? null),
		setItem: jest.fn((key: string, value: string) => {
			items.set(key, value)
		}),
		deleteItemAsync: jest.fn(async (key: string) => {
			items.delete(key)
		}),
	}
})

jest.mock('expo-localization', () => ({
	getLocales: () => [{ languageCode: 'en' }],
}))

jest.mock('expo-splash-screen', () => ({
	preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
	hide: jest.fn(),
	setOptions: jest.fn(),
	hideAsync: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@sentry/react-native', () => ({
	init: jest.fn(),
	captureException: jest.fn(),
	captureMessage: jest.fn(),
	addBreadcrumb: jest.fn(),
	withScope: jest.fn((cb: (scope: { setTag: jest.Mock; setContext: jest.Mock }) => void) =>
		cb({ setTag: jest.fn(), setContext: jest.fn() }),
	),
	wrap: <T>(Component: T) => Component,
	reactNavigationIntegration: () => ({ registerNavigationContainer: jest.fn() }),
}))

// One shared PostHog client: `new PostHog()` (src/shared/api/analytics/client.ts) and `usePostHog()` return
// the same jest.fns. Flag hooks return "not loaded" by default; a test overrides them with
// `jest.mocked(useFeatureFlag).mockReturnValue(…)`. Everything is reset after each test.
jest.mock('posthog-react-native', () => {
	const client = {
		capture: jest.fn(),
		identify: jest.fn(),
		reset: jest.fn(),
		screen: jest.fn(() => Promise.resolve()),
		register: jest.fn(() => Promise.resolve()),
		debug: jest.fn(),
		optIn: jest.fn(() => Promise.resolve()),
		optOut: jest.fn(() => Promise.resolve()),
		optedOut: false,
		getFeatureFlag: jest.fn(),
		getFeatureFlags: jest.fn(),
		getFeatureFlagPayload: jest.fn(),
		onFeatureFlags: jest.fn(() => () => undefined),
		reloadFeatureFlagsAsync: jest.fn(() => Promise.resolve()),
		flush: jest.fn(() => Promise.resolve()),
	}
	const hooks = {
		useFeatureFlag: jest.fn(() => undefined),
		useFeatureFlags: jest.fn(() => undefined),
		useFeatureFlagWithPayload: jest.fn(() => [undefined, undefined]),
	}
	const PostHog = jest.fn(() => client)
	// The keys resetAnalytics() keeps (values from @posthog/core's PostHogPersistedProperty enum).
	const PostHogPersistedProperty = {
		OptedOut: 'opted_out',
		InstalledAppBuild: 'installed_app_build',
		InstalledAppVersion: 'installed_app_version',
		DeviceId: 'device_id',
	}
	return {
		__esModule: true,
		default: PostHog,
		PostHog,
		PostHogPersistedProperty,
		PostHogProvider: ({ children }: { children: unknown }) => children,
		usePostHog: () => client,
		...hooks,
		/** Test-only: the shared client, and a reset run after each test. */
		__client: client,
		__reset: () => {
			for (const fn of Object.values(client)) if (jest.isMockFunction(fn)) fn.mockClear()
			client.optedOut = false
			hooks.useFeatureFlag.mockReset().mockReturnValue(undefined)
			hooks.useFeatureFlags.mockReset().mockReturnValue(undefined)
			hooks.useFeatureFlagWithPayload.mockReset().mockReturnValue([undefined, undefined])
		},
	}
})

// Tests never reach the network. A test that needs `fetch` mocks it itself (after this beforeEach).
beforeEach(() => {
	jest
		.spyOn(globalThis, 'fetch')
		.mockImplementation(input =>
			Promise.reject(
				new Error(`Unexpected network request in a test: ${input instanceof Request ? input.url : String(input)}`),
			),
		)
})

afterEach(() => {
	jest.useRealTimers()
	destroyTestQueryClients()
	// Undo bindQueryManagers() and any setOnline/setFocused a test left behind.
	onlineManager.setEventListener(() => undefined)
	onlineManager.setOnline(true)
	focusManager.setEventListener(() => undefined)
	focusManager.setFocused(undefined)
	jest.requireMock<{ __clearAllStores: () => void }>('react-native-mmkv').__clearAllStores()
	jest.requireMock<{ __reset: () => void }>('posthog-react-native').__reset()
	jest.restoreAllMocks()
})
