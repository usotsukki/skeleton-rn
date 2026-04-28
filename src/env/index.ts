import { Platform } from 'react-native'
import { clientEnvSchema } from './clientEnvSchema'

const clientEnv = clientEnvSchema.parse(process.env)

const ENABLE_DEV_MODE = clientEnv.EXPO_PUBLIC_ENABLE_DEV_MODE === 'true'

export const android = Platform.OS === 'android'
export const IS_ANDROID = android

export const ios = Platform.OS === 'ios'
export const IS_IOS = ios

export const web = Platform.OS === 'web'
export const IS_WEB = web

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
