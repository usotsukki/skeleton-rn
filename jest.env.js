// Set before any expo modules load to avoid "EXPO_OS is not defined" warning
process.env.EXPO_OS = process.env.EXPO_OS || 'ios'

// `src/shared/env` Zod schema — not production, so CLIENT_ENV_REQUIRED_IN_PRODUCTION is skipped
process.env.EXPO_PUBLIC_NODE_ENV = process.env.EXPO_PUBLIC_NODE_ENV || 'testing'
process.env.EXPO_PUBLIC_ENABLE_DEV_MODE = process.env.EXPO_PUBLIC_ENABLE_DEV_MODE || 'false'
// Without it the auth screens hide the Google button on iOS (the Jest platform).
process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID =
	process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'jest-ios.apps.googleusercontent.com'
// Tests run as a configured app (the SDK is mocked in setup.ts); unconfigured behaviour is tested explicitly.
process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN || 'phc_jest'
