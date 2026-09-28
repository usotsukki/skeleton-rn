import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { isLoopbackUrl, toAndroidEmulatorHostUrl } from '@app/utils/isLoopbackUrl'
import { clientEnvSchema } from './clientEnvSchema'

// Expo inlines only static `process.env.EXPO_PUBLIC_*` member reads at build time. Passing `process.env`
// itself works in dev (runtime polyfill) but is empty in release bundles, so every key is listed here.
const clientEnv = clientEnvSchema.parse({
	EXPO_PUBLIC_NODE_ENV: process.env.EXPO_PUBLIC_NODE_ENV,
	EXPO_PUBLIC_ENABLE_DEV_MODE: process.env.EXPO_PUBLIC_ENABLE_DEV_MODE,
	EXPO_PUBLIC_LOG_DEBUG: process.env.EXPO_PUBLIC_LOG_DEBUG,
	EXPO_PUBLIC_LOG_LEVEL: process.env.EXPO_PUBLIC_LOG_LEVEL,
	EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
	EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
	EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
	EXPO_PUBLIC_EAS_PROJECT_ID: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
	EXPO_PUBLIC_EAS_OWNER: process.env.EXPO_PUBLIC_EAS_OWNER,
	EXPO_PUBLIC_BASE_API_URL: process.env.EXPO_PUBLIC_BASE_API_URL,
	EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
	EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
	EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN: process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN,
	EXPO_PUBLIC_POSTHOG_HOST: process.env.EXPO_PUBLIC_POSTHOG_HOST,
})

const ENABLE_DEV_MODE = clientEnv.EXPO_PUBLIC_ENABLE_DEV_MODE === 'true'

export const IS_ANDROID = Platform.OS === 'android'
export const IS_IOS = Platform.OS === 'ios'
export const IS_WEB = Platform.OS === 'web'

export const IS_DEV = (typeof __DEV__ === 'boolean' && __DEV__) || !!Number(ENABLE_DEV_MODE)
export const IS_TEST = clientEnv.EXPO_PUBLIC_NODE_ENV === 'testing'
export const IS_PROD = clientEnv.EXPO_PUBLIC_NODE_ENV === 'production' && !IS_DEV && !IS_TEST

export const LOG_DEBUG = clientEnv.EXPO_PUBLIC_LOG_DEBUG !== 'false' ? (clientEnv.EXPO_PUBLIC_LOG_DEBUG ?? '') : ''
export const LOG_LEVEL = clientEnv.EXPO_PUBLIC_LOG_LEVEL
export const SENTRY_DEBUG = !IS_PROD && false
export const TRANSLATIONS_DEBUG = !IS_PROD && false

export const SENTRY_DSN = clientEnv.EXPO_PUBLIC_SENTRY_DSN

export const GOOGLE_WEB_CLIENT_ID = clientEnv.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
export const GOOGLE_IOS_CLIENT_ID = clientEnv.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
/** iOS can't configure or run Google Sign-In without its client id (red box at launch, generic failure on tap). */
export const IS_GOOGLE_SIGN_IN_CONFIGURED = Platform.OS !== 'ios' || !!GOOGLE_IOS_CLIENT_ID

export const EAS_PROJECT_ID = clientEnv.EXPO_PUBLIC_EAS_PROJECT_ID

export const BASE_API_URL = clientEnv.EXPO_PUBLIC_BASE_API_URL

// An Android emulator's own 127.0.0.1 is the emulator; 10.0.2.2 is the machine running the local stack.
const IS_ANDROID_EMULATOR_DEV = typeof __DEV__ === 'boolean' && __DEV__ && Platform.OS === 'android' && !Device.isDevice

export const SUPABASE_URL = IS_ANDROID_EMULATOR_DEV
	? toAndroidEmulatorHostUrl(clientEnv.EXPO_PUBLIC_SUPABASE_URL)
	: clientEnv.EXPO_PUBLIC_SUPABASE_URL
export const SUPABASE_PUBLISHABLE_KEY = clientEnv.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
/** The bundle talks to the local stack (`yarn backend:start`), as inlined when Metro built it. */
export const IS_LOCAL_BACKEND = isLoopbackUrl(clientEnv.EXPO_PUBLIC_SUPABASE_URL)

/** PostHog project token (public, ships in the app). Unset = analytics and feature flags disabled. */
export const POSTHOG_PROJECT_TOKEN = clientEnv.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN
export const POSTHOG_HOST = clientEnv.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com'

export type { ClientEnv } from './clientEnvSchema'
