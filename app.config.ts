import { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config: initConfig }: ConfigContext): ExpoConfig => {
	const appName = initConfig?.name || 'Skeleton'
	const environment = process.env.NODE_ENV as 'production' | 'development' | 'testing'

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
			},
		},
		android: {
			package: bundleIdentifier,
		},
		extra: {
			eas: {
				projectId: '6afd57d1-5bac-48fc-b3f3-40a510289ae2',
			},
		},
	}
}
