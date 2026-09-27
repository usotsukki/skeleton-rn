import { Platform } from 'react-native'
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

export const EAS_PROJECT_ID = clientEnv.EXPO_PUBLIC_EAS_PROJECT_ID

export const BASE_API_URL = clientEnv.EXPO_PUBLIC_BASE_API_URL

export const SUPABASE_URL = clientEnv.EXPO_PUBLIC_SUPABASE_URL
export const SUPABASE_PUBLISHABLE_KEY = clientEnv.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export type { ClientEnv } from './clientEnvSchema'
