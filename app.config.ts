import type { ConfigContext, ExpoConfig } from 'expo/config'
import { z, type ZodError } from 'zod'
import envRules from './env.rules.json'
import { hasAndroidMapsKey } from './metro/androidMapsConfig'

/** Required only for native builds, and only for the platform that uses them. */
const nativeBuildOnlyProductionKeys = new Map<string, 'ios' | 'android'>([
	['GOOGLE_MAPS_API_KEY_ANDROID', 'android'],
	['GOOGLE_MAPS_API_KEY_IOS', 'ios'],
	['APPLE_TEAM_ID', 'ios'],
	['EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID', 'ios'],
])

function envKeysRequiredInProduction(map: Readonly<Record<string, boolean>>): string[] {
	return (Object.entries(map) as [string, boolean][]).filter(([, required]) => required).map(([key]) => key)
}

function optionalEnvString(val: unknown): string | undefined {
	if (val === undefined || val === null) return undefined
	const s = String(val).trim()
	return s === '' ? undefined : s
}

function formatZodEnvError(err: ZodError): string {
	return err.issues.map(i => `${i.path.join('.') || '(root)'}: ${i.message}`).join('\n')
}

const appConfigProductionKeys = envKeysRequiredInProduction(envRules.appConfigProductionRequired)

const nodeEnv = z.enum(['development', 'production', 'testing'])

const appConfigEnvSchema = z.object({
	EXPO_PUBLIC_NODE_ENV: z.preprocess(optionalEnvString, nodeEnv.optional()),
	EXPO_PUBLIC_EAS_PROJECT_ID: z.preprocess(optionalEnvString, z.string().optional()),
	EXPO_PUBLIC_EAS_OWNER: z.preprocess(optionalEnvString, z.string().optional()),
	EXPO_PUBLIC_APP_NAME: z.preprocess(optionalEnvString, z.string().optional()),
	EXPO_PUBLIC_APP_SLUG: z.preprocess(optionalEnvString, z.string().optional()),
	EXPO_PUBLIC_APP_SCHEME: z.preprocess(optionalEnvString, z.string().optional()),
	EXPO_PUBLIC_IOS_BUNDLE_ID: z.preprocess(optionalEnvString, z.string().optional()),
	EXPO_PUBLIC_IOS_BUNDLE_ID_TESTING: z.preprocess(optionalEnvString, z.string().optional()),
	EXPO_PUBLIC_ANDROID_PACKAGE: z.preprocess(optionalEnvString, z.string().optional()),
	EXPO_PUBLIC_ANDROID_PACKAGE_TESTING: z.preprocess(optionalEnvString, z.string().optional()),
	GOOGLE_MAPS_API_KEY_ANDROID: z.preprocess(optionalEnvString, z.string().optional()),
	GOOGLE_MAPS_API_KEY_IOS: z.preprocess(optionalEnvString, z.string().optional()),
	APPLE_TEAM_ID: z.preprocess(optionalEnvString, z.string().optional()),
	EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.preprocess(optionalEnvString, z.string().optional()),
})

type AppConfigEnv = z.infer<typeof appConfigEnvSchema>

function parseAppConfigEnv(env: NodeJS.ProcessEnv): AppConfigEnv {
	return appConfigEnvSchema.parse(env)
}

function getInitEasProjectId(initConfig: Partial<ExpoConfig>): string | undefined {
	const extra = initConfig.extra
	if (typeof extra !== 'object' || extra === null || !('eas' in extra)) return undefined
	const eas = (extra as { eas?: unknown }).eas
	if (typeof eas !== 'object' || eas === null || !('projectId' in eas)) return undefined
	return optionalEnvString((eas as { projectId?: unknown }).projectId)
}

function hasNonEmptyValue(value: unknown): boolean {
	if (Array.isArray(value)) return value.some(hasNonEmptyValue)
	return optionalEnvString(value) !== undefined
}

function validateProductionResolvedValues(
	environment: AppConfigEnv['EXPO_PUBLIC_NODE_ENV'] | 'development',
	values: Record<string, unknown>,
	requireNativeBuildOnlyValues: boolean,
	buildPlatform: string | undefined,
): void {
	if (environment !== 'production') return
	const missing = appConfigProductionKeys.filter(key => {
		const keyPlatform = nativeBuildOnlyProductionKeys.get(key)
		if (keyPlatform && !requireNativeBuildOnlyValues) return false
		// EAS sets EAS_BUILD_PLATFORM; without it (local native build) require both platforms' keys.
		if (keyPlatform && buildPlatform && keyPlatform !== buildPlatform) return false
		return !hasNonEmptyValue(values[key])
	})
	if (missing.length > 0) {
		throw new Error(
			`Invalid environment (app.config):\n${missing
				.map(key => `${key}: Required when EXPO_PUBLIC_NODE_ENV is production (${key})`)
				.join('\n')}`,
		)
	}
}

function resolveScheme(
	schemeFromEnv: string | undefined,
	initConfig: Partial<ExpoConfig>,
	slug: string,
): string | string[] {
	const fromEnv = schemeFromEnv?.trim()
	if (fromEnv) return fromEnv
	const s = initConfig.scheme
	if (Array.isArray(s) && s.length > 0) return s
	if (typeof s === 'string' && s.length > 0) return s
	return slug
}

/** `123-abc.apps.googleusercontent.com` → `com.googleusercontent.apps.123-abc` (iOS OAuth redirect scheme). */
function googleIosUrlScheme(iosClientId: string | undefined): string | undefined {
	if (!iosClientId) return undefined
	const suffix = '.apps.googleusercontent.com'
	// The same value is passed to GoogleSignin.configure({ iosClientId }), so the reversed scheme is not accepted.
	if (!iosClientId.endsWith(suffix)) {
		throw new Error(
			`EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must be the iOS OAuth client id (…${suffix}), not the reversed URL scheme.`,
		)
	}
	return `com.googleusercontent.apps.${iosClientId.slice(0, -suffix.length)}`
}

function requireNonEmpty(label: string, value: string | undefined): string {
	const v = value?.trim()
	if (!v) {
		throw new Error(`${label} is required (set the env var or the same field in app.json).`)
	}
	return v
}

/**
 * Sentry's build scripts upload source maps on every build (iOS also in Debug) and fail it without
 * credentials. Expo CLI evaluates this file after loading env files and before it starts xcodebuild or
 * gradle, which inherit this process's env, so a build without a token skips the upload. Builds with
 * `SENTRY_AUTH_TOKEN` (local or EAS) are unchanged.
 */
function skipSentryUploadWithoutToken(): void {
	if (process.env.SENTRY_AUTH_TOKEN?.trim()) return
	process.env.SENTRY_DISABLE_AUTO_UPLOAD ??= 'true'
}

export default ({ config: initConfig }: ConfigContext): ExpoConfig => {
	skipSentryUploadWithoutToken()
	let env: AppConfigEnv
	try {
		env = parseAppConfigEnv(process.env)
	} catch (e) {
		if (e instanceof z.ZodError) {
			throw new Error(`Invalid environment (app.config):\n${formatZodEnvError(e)}`)
		}
		throw e
	}

	const environment =
		(env.EXPO_PUBLIC_NODE_ENV as 'production' | 'development' | 'testing' | undefined) ?? 'development'
	const projectId = env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim() || getInitEasProjectId(initConfig)
	const owner = env.EXPO_PUBLIC_EAS_OWNER?.trim() || initConfig.owner

	const baseName = requireNonEmpty(
		'App display name (EXPO_PUBLIC_APP_NAME or expo.name)',
		env.EXPO_PUBLIC_APP_NAME?.trim() || initConfig?.name,
	)

	const nameByEnv: Record<string, string> = {
		production: baseName,
		testing: `${baseName} Testing`,
		development: `${baseName} Development`,
	}
	const name = nameByEnv[environment] ?? `${baseName} Development`

	const slug = requireNonEmpty(
		'App slug (EXPO_PUBLIC_APP_SLUG or expo.slug)',
		env.EXPO_PUBLIC_APP_SLUG?.trim() || initConfig?.slug,
	)

	const scheme = resolveScheme(env.EXPO_PUBLIC_APP_SCHEME, initConfig, slug)

	const iosBundleFromEnv = env.EXPO_PUBLIC_IOS_BUNDLE_ID?.trim()
	const iosBundleFromConfig = initConfig.ios?.bundleIdentifier?.trim()
	const iosBundleBase = requireNonEmpty(
		'iOS bundle id (EXPO_PUBLIC_IOS_BUNDLE_ID or expo.ios.bundleIdentifier)',
		iosBundleFromEnv || iosBundleFromConfig,
	)

	const bundleIdentifier =
		environment === 'testing' ? env.EXPO_PUBLIC_IOS_BUNDLE_ID_TESTING?.trim() || `${iosBundleBase}.test` : iosBundleBase

	const androidFromEnv = env.EXPO_PUBLIC_ANDROID_PACKAGE?.trim()
	const androidFromConfig = initConfig.android?.package?.trim()
	const androidBase = androidFromEnv || androidFromConfig || iosBundleBase

	const androidPackage =
		environment === 'testing'
			? env.EXPO_PUBLIC_ANDROID_PACKAGE_TESTING?.trim() ||
				(androidFromEnv || androidFromConfig ? `${androidBase}.test` : bundleIdentifier)
			: androidBase

	const androidMapsKey = env.GOOGLE_MAPS_API_KEY_ANDROID
	const iosMapsKey = env.GOOGLE_MAPS_API_KEY_IOS
	const appleTeamId = env.APPLE_TEAM_ID || initConfig.ios?.appleTeamId
	const requireNativeBuildOnlyValues =
		process.env.EAS_BUILD === 'true' || process.env.EXPO_REQUIRE_NATIVE_CONFIG === 'true'

	validateProductionResolvedValues(
		environment,
		{
			EXPO_PUBLIC_NODE_ENV: environment,
			EXPO_PUBLIC_EAS_PROJECT_ID: projectId,
			EXPO_PUBLIC_EAS_OWNER: owner,
			EXPO_PUBLIC_APP_NAME: baseName,
			EXPO_PUBLIC_APP_SLUG: slug,
			EXPO_PUBLIC_APP_SCHEME: scheme,
			EXPO_PUBLIC_IOS_BUNDLE_ID: iosBundleBase,
			EXPO_PUBLIC_IOS_BUNDLE_ID_TESTING: env.EXPO_PUBLIC_IOS_BUNDLE_ID_TESTING,
			EXPO_PUBLIC_ANDROID_PACKAGE: androidBase,
			EXPO_PUBLIC_ANDROID_PACKAGE_TESTING: env.EXPO_PUBLIC_ANDROID_PACKAGE_TESTING,
			GOOGLE_MAPS_API_KEY_ANDROID: androidMapsKey,
			GOOGLE_MAPS_API_KEY_IOS: iosMapsKey,
			APPLE_TEAM_ID: appleTeamId,
			EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
		},
		requireNativeBuildOnlyValues,
		process.env.EAS_BUILD_PLATFORM,
	)

	const googleUrlScheme = googleIosUrlScheme(env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID)

	const plugins = (initConfig.plugins ?? []).flatMap((p): NonNullable<ExpoConfig['plugins']> => {
		const pluginName = Array.isArray(p) ? p[0] : p
		if (pluginName === 'react-native-maps') {
			return [['react-native-maps', { androidGoogleMapsApiKey: androidMapsKey, iosGoogleMapsApiKey: iosMapsKey }]]
		}
		// Options select the plugin's non-Firebase mode (iOS URL scheme only). Without a client id
		// there is nothing to register, so skip it rather than fall back to Firebase config files.
		if (pluginName === '@react-native-google-signin/google-signin') {
			return googleUrlScheme ? [[pluginName, { iosUrlScheme: googleUrlScheme }]] : []
		}
		return [p]
	})

	const result: ExpoConfig = {
		...initConfig,
		plugins,
		name,
		slug,
		scheme,
		userInterfaceStyle: 'automatic',
		ios: {
			...initConfig.ios,
			bundleIdentifier,
			usesAppleSignIn: true,
			requireFullScreen: true,
			appleTeamId,
			config: {
				googleMapsApiKey: env.GOOGLE_MAPS_API_KEY_IOS,
				usesNonExemptEncryption: false,
			},
			infoPlist: {
				UIBackgroundModes: ['remote-notification', 'processing'],
				CADisableMinimumFrameDurationOnPhone: true,
			},
		},
		android: {
			...initConfig.android,
			package: androidPackage,
			config: {
				googleMaps: { apiKey: env.GOOGLE_MAPS_API_KEY_ANDROID },
			},
		},
		runtimeVersion: {
			policy: 'appVersion',
		},
		// expo-constants regenerates the embedded config on compile, but the native key changes only on
		// prebuild. Read the generated native manifest so env changes cannot enable an unconfigured map.
		extra: { ...initConfig.extra, androidMapsConfigured: hasAndroidMapsKey(__dirname) },
	}

	if (projectId) {
		result.updates = {
			...initConfig.updates,
			url: `https://u.expo.dev/${projectId}`,
		}
		result.extra = {
			...result.extra,
			eas: {
				...(typeof initConfig.extra === 'object' &&
				initConfig.extra !== null &&
				'eas' in initConfig.extra &&
				typeof (initConfig.extra as { eas?: Record<string, unknown> }).eas === 'object'
					? (initConfig.extra as { eas: Record<string, unknown> }).eas
					: {}),
				projectId,
			},
		}
	}

	if (owner) {
		result.owner = owner
	}

	return result
}
