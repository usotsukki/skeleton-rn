import type { ConfigContext, ExpoConfig } from 'expo/config'
import appConfig from '../../app.config'

/** The static app.json part Expo passes to app.config.ts. */
const BASE: Partial<ExpoConfig> = {
	name: 'Demo',
	slug: 'demo',
	scheme: 'demo',
	ios: { bundleIdentifier: 'com.acme.demo' },
	android: { package: 'com.acme.demo' },
	plugins: ['expo-router', '@react-native-google-signin/google-signin', 'react-native-maps'],
}

/** Production values for every key `env.rules.json` requires of app.config. */
export const PRODUCTION_ENV = {
	EXPO_PUBLIC_NODE_ENV: 'production',
	EXPO_PUBLIC_EAS_PROJECT_ID: '00000000-0000-0000-0000-000000000000',
	EXPO_PUBLIC_EAS_OWNER: 'acme',
	EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: '123-abc.apps.googleusercontent.com',
	APPLE_TEAM_ID: 'ABCDE12345',
	GOOGLE_MAPS_API_KEY_ANDROID: 'android-key',
	GOOGLE_MAPS_API_KEY_IOS: 'ios-key',
}

/** Evaluates app.config.ts with exactly `env` (plus PATH), like a fresh Expo CLI process; returns the env it left. */
export function evaluate(env: Record<string, string>, base: Partial<ExpoConfig> = BASE) {
	const saved = process.env
	// NODE_ENV is typed as required but Expo CLI doesn't always set it.
	const processEnv = { PATH: saved.PATH, ...env } as unknown as NodeJS.ProcessEnv
	process.env = processEnv
	try {
		return { config: appConfig({ config: structuredClone(base) } as ConfigContext), env: processEnv }
	} finally {
		process.env = saved
	}
}

export const evaluateConfig = (env: Record<string, string>, base?: Partial<ExpoConfig>) => evaluate(env, base).config

export const pluginNamed = (config: ExpoConfig, name: string) =>
	config.plugins?.find(p => (Array.isArray(p) ? p[0] : p) === name)
