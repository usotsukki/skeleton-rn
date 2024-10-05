import { Platform } from 'react-native'

const ENABLE_DEV_MODE = process.env.EXPO_PUBLIC_ENABLE_DEV_MODE === 'true'

export const android = Platform.OS === 'android'
export const IS_ANDROID = android

export const ios = Platform.OS === 'ios'
export const IS_IOS = ios

export const web = Platform.OS === 'web'
export const IS_WEB = web

export const IS_DEV = (typeof __DEV__ === 'boolean' && __DEV__) || !!Number(ENABLE_DEV_MODE)
export const IS_TEST = process.env.EXPO_PUBLIC_IS_TESTING === 'true'
export const IS_PROD = !IS_DEV && !IS_TEST

export const LOG_DEBUG = process.env.EXPO_PUBLIC_LOG_DEBUG
export const LOG_LEVEL = process.env.EXPO_PUBLIC_LOG_LEVEL
