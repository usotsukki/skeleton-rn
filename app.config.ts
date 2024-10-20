import { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config: initConfig }: ConfigContext): ExpoConfig => {
	const appName = initConfig?.name || 'Skeleton'
	const environment = process.env.EXPO_PUBLIC_NODE_ENV as 'production' | 'development' | 'testing'
	const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID

	const name = {
		production: appName,
		testing: `${appName} Testing`,
		development: `${appName} Development`,
	}[environment]

	const bundleIdentifier = environment === 'testing' ? 'com.skeleton.test' : 'com.skeleton'

	return {
		...initConfig,
		name,
		slug: initConfig?.slug || 'skeleton',
		userInterfaceStyle: environment === 'development' ? 'dark' : 'automatic',
		ios: {
			...initConfig.ios,
			bundleIdentifier,
			usesAppleSignIn: true,
			googleServicesFile: process.env.GOOGLE_SERVICE_FILE_IOS || './GoogleService-Info.plist',
			config: {
				googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_IOS,
				usesNonExemptEncryption: false,
			},
			infoPlist: {
				UIBackgroundModes: ['remote-notification', 'processing'],
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
			url: `https://u.expo.dev/${projectId}`,
		},
		runtimeVersion: {
			policy: 'appVersion',
		},
		extra: {
			eas: {
				projectId,
			},
		},
	}
}
