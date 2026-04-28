/**
 * Global Jest mocks applied to every test via setupFilesAfterEach.
 * Add reusable mocks here rather than duplicating in individual test files.
 *
 * Note: jest.mock factories must not reference out-of-scope variables. Imports
 * (incl. React) and JSX get hoisted by Babel/NativeWind transforms and trip
 * the validation. Factories below stay JSX-free — return `children` directly.
 */

// Wrap React Query notifications in act() so React state updates are always inside act()
// boundaries, eliminating "not wrapped in act(...)" console warnings in hook tests.
const { notifyManager } = require('@tanstack/react-query')
const { act } = require('@testing-library/react-native')
notifyManager.setNotifyFunction((fn: () => void) => act(fn))

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
	}
})

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
			createAnimatedComponent: passthrough,
		},
		View,
		createAnimatedComponent: passthrough,
		useSharedValue: () => ({ ...sharedRef }),
		useAnimatedStyle: (cb: () => unknown) => cb(),
		useAnimatedScrollHandler: () => jest.fn(),
		useAnimatedReaction: jest.fn(),
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

jest.mock('expo-localization', () => ({
	getLocales: () => [{ languageCode: 'en' }],
}))

jest.mock('expo-splash-screen', () => ({
	preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
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
