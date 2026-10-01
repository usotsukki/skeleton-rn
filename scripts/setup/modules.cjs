// What `yarn setup` can remove. Each module lists everything that exists only for it; code shared with
// the rest of the app is wrapped in `#region template:<id>` … `#endregion template:<id>` markers instead.
//   paths    files or folders to delete (already gone = fine)
//   deps     package.json dependencies / devDependencies
//   plugins  app.json plugin names
//   i18n     JSON paths deleted from every file in src/shared/translations/languages
//   env      env.rules.json keys (both maps)
//   knip     entries removed from knip.jsonc ignore lists
//   native   true when removal changes the native project (prebuild + new app version)

const ROUTES = 'src/app/(app)/(drawer)/(tabs)'

const demos = [
	{
		id: 'map',
		label: 'Map demo',
		description: 'Map tab (react-native-maps), Google Maps keys and their production requirement',
		paths: [
			'src/features/map',
			`${ROUTES}/Map`,
			'metro/androidMapsConfig.js',
			'metro/androidMapsConfig.d.ts',
			'metro/reactNativeMapsStub.tsx',
			'metro/__tests__/androidMapsConfig.test.ts',
			'__tests__/appConfig.maps.test.ts',
		],
		deps: ['react-native-maps'],
		plugins: ['react-native-maps'],
		i18n: [['map'], ['modules', 'map']],
		env: ['GOOGLE_MAPS_API_KEY_ANDROID', 'GOOGLE_MAPS_API_KEY_IOS'],
		native: true,
	},
	{
		id: 'skia',
		label: 'Skia demo',
		description: 'Skia tab (animated solar system) and @shopify/react-native-skia',
		paths: ['src/features/skia', `${ROUTES}/Skia`],
		deps: ['@shopify/react-native-skia'],
		i18n: [['skia'], ['skiaScreen']],
		native: true,
	},
	{
		id: 'list-demo',
		label: 'List states demo',
		description: 'Home → "Open list states demo" (every CachedList state with a fake query)',
		paths: [
			'src/features/home/ListDemoScreen.tsx',
			'src/features/home/components/ListDemoLink.tsx',
			`${ROUTES}/Home/ListDemo.tsx`,
		],
		i18n: [['listDemo']],
	},
	{
		id: 'feature-flag-demo',
		label: 'Feature flag demo',
		description: 'Home row showing the `template-demo` PostHog flag (the flag registry stays)',
		paths: ['src/features/home/components/FeatureFlagDemo.tsx'],
		i18n: [
			['homeScreen', 'featureFlag'],
			['homeScreen', 'flagState'],
		],
	},
	{
		id: 'component-gallery',
		label: 'Component gallery',
		description: 'Home sections with buttons, inputs, toasts, sheets and alerts (the profile card stays)',
		paths: ['src/features/home/components/ComponentGallery.tsx'],
		i18n: [
			'buttons primary secondary ghost destructive link inputs textField textFieldPlaceholder',
			'emailPlaceholder passwordPlaceholder checkbox switch triggers fireToastSuccess fireToastError',
			'toastSuccess toastError openSheet sheetTitle sheetBody openFormSheet formSheetTitle formSheetSubmit',
			'formSheetSubmitted showAlert alertTitle alertBody confirmDelete deleteTitle demoItemName deleted',
		]
			.join(' ')
			.split(' ')
			.map(key => ['homeScreen', key]),
	},
]

/** Installed for new apps but unused by the demo. */
const extra = (id, dep, description, more = {}) => ({
	id,
	label: dep,
	description,
	deps: [dep],
	native: !['luxon', 'es-toolkit'].includes(id),
	...more,
})

const extras = [
	extra('location', 'expo-location', 'GPS location (needs a location permission string when used)', {
		knip: ['expo-location'],
	}),
	extra('image-picker', 'expo-image-picker', 'photo library / camera picker (needs permission strings)', {
		knip: ['expo-image-picker'],
	}),
	extra('document-picker', 'expo-document-picker', 'file picker', { knip: ['expo-document-picker'] }),
	extra('image-manipulator', 'expo-image-manipulator', 'resize / crop / rotate images', {
		knip: ['expo-image-manipulator'],
	}),
	extra('video', 'expo-video', 'video player', { plugins: ['expo-video'] }),
	extra('sqlite', 'expo-sqlite', 'on-device SQLite database', { plugins: ['expo-sqlite'] }),
	extra('screen-orientation', 'expo-screen-orientation', 'lock or read screen orientation', {
		plugins: ['expo-screen-orientation'],
	}),
	extra('datetimepicker', '@react-native-community/datetimepicker', 'native date / time picker', {
		plugins: ['@react-native-community/datetimepicker'],
	}),
	extra('notifications', 'expo-notifications', 'push notifications (plugin, icon, iOS background mode)', {
		plugins: ['expo-notifications'],
		paths: ['assets/png/notification-icon.png'],
	}),
	extra('luxon', 'luxon', 'date/time library', { deps: ['luxon', '@types/luxon'], knip: ['luxon', '@types/luxon'] }),
	extra('es-toolkit', 'es-toolkit', 'lodash-style utilities', { knip: ['es-toolkit'] }),
	extra('expo-ui', '@expo/ui', 'SwiftUI / Jetpack Compose components', { knip: ['@expo/ui'] }),
]

const docs = [
	{
		id: 'template-docs',
		label: 'Template readme and demo clips',
		description: 'Replace readme.md with a short app readme and delete docs/media',
		paths: ['docs/media'],
		readme: true,
	},
]

const groups = [
	{ title: 'Demos', modules: demos },
	{ title: 'Starter extras (installed, unused by the demo)', modules: extras },
	{ title: 'Template docs', modules: docs },
]

module.exports = { groups, modules: groups.flatMap(group => group.modules) }
