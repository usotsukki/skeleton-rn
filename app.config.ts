import { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config: initConfig }: ConfigContext): ExpoConfig => {
	const appName = initConfig?.name || 'Skeleton'
	const environment = process.env.EXPO_PUBLIC_NODE_ENV as 'production' | 'development' | 'testing'
	const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID
	const owner = process.env.EXPO_PUBLIC_EAS_OWNER

	const name = {
		production: appName,
		testing: `${appName} Testing`,
		development: `${appName} Development`,
	}[environment]

	const bundleIdentifier = environment === 'testing' ? 'com.skeleton.test' : 'com.skeleton'

	const androidMapsKey = process.env.GOOGLE_MAPS_API_KEY_ANDROID
	const iosMapsKey = process.env.GOOGLE_MAPS_API_KEY_IOS

	const plugins = (initConfig.plugins ?? []).map(p => {
		const pluginName = Array.isArray(p) ? p[0] : p
		if (pluginName === 'react-native-maps') {
			return ['react-native-maps', { androidGoogleMapsApiKey: androidMapsKey, iosGoogleMapsApiKey: iosMapsKey }]
		}
		return p
	})

	return {
		...initConfig,
		plugins: plugins as ExpoConfig['plugins'],
		name,
		slug: initConfig?.slug || 'skeleton',
		userInterfaceStyle: 'dark',
		ios: {
			...initConfig.ios,
			bundleIdentifier,
			usesAppleSignIn: true,
			requireFullScreen: true,
			appleTeamId: process.env.APPLE_TEAM_ID || initConfig.ios?.appleTeamId,
			googleServicesFile: process.env.GOOGLE_SERVICE_FILE_IOS || './GoogleService-Info.plist',
			config: {
				googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_IOS,
				usesNonExemptEncryption: false,
			},
			infoPlist: {
				UIBackgroundModes: ['remote-notification', 'processing'],
				CADisableMinimumFrameDurationOnPhone: true,
			},
		},
		android: {
			...initConfig.android,
			package: bundleIdentifier,
			googleServicesFile: process.env.GOOGLE_SERVICE_FILE_ANDROID || './google-services.json',
			config: {
				googleMaps: { apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID },
			},
		},
		updates: {
			url: projectId ? `https://u.expo.dev/${projectId}` : 'https://u.expo.dev/6afd57d1-5bac-48fc-b3f3-40a510289ae2',
		},
		runtimeVersion: {
			policy: 'appVersion',
		},
		extra: {
			eas: {
				projectId: projectId || '6afd57d1-5bac-48fc-b3f3-40a510289ae2',
			},
		},
		owner: owner || 'skeleton-rn',
	}
}
